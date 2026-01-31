/* eslint-env jest */
const extractFrames = require('../src/utils/extract-frames')
const childProcess = require('child_process')
const path = require('path')

jest.mock('child_process')
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue()
  }
}))

describe('extractFrames', () => {
  it('should use execFile to prevent command injection', async () => {
    // Mock execFile implementation to simulate success
    childProcess.execFile.mockImplementation((file, args, callback) => {
      if (file === 'ffprobe') {
        callback(null, '10.0') // 10 seconds duration
      } else if (file === 'ffmpeg') {
        callback(null, '')
      } else {
        callback(new Error(`Unknown command: ${file}`))
      }
    })

    const inputFile = 'video.mp4'
    const framesOutputDir = '/tmp/frames'

    await extractFrames({
      frames: 5,
      inputFile,
      framesOutputDir
    })

    expect(childProcess.execFile).toHaveBeenCalledTimes(2)

    // Check ffprobe call
    expect(childProcess.execFile).toHaveBeenNthCalledWith(1,
      'ffprobe',
      [
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        inputFile
      ],
      expect.any(Function)
    )

    // Check ffmpeg call
    // duration = 10, frames = 5. numFrames = 5. frameRate = 0.5.
    // numFrames = min(5, 10) = 5.
    // frameRate = 5 / 10 = 0.5.
    expect(childProcess.execFile).toHaveBeenNthCalledWith(2,
      'ffmpeg',
      [
        '-i', inputFile,
        '-vf', 'fps=0.5',
        '-frames:v', '5',
        '-q:v', '2',
        path.join(framesOutputDir, 'frame_%03d.jpg'),
        '-loglevel', 'error'
      ],
      expect.any(Function)
    )
  })
})
