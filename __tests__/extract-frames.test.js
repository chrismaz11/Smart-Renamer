/* eslint-env jest */
const extractFrames = require('../src/utils/extract-frames')
const childProcess = require('child_process')
const path = require('path')

jest.mock('child_process')
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined)
  }
}))

describe('extractFrames', () => {
  it('should use execFile with array arguments (secure behavior)', async () => {
    // Mock execFile to return success
    childProcess.execFile.mockImplementation((file, args, cb) => {
      if (file === 'ffprobe') {
        cb(null, '10.0') // 10 seconds duration
      } else if (file === 'ffmpeg') {
        cb(null, '')
      }
    })

    const inputFile = 'test video.mp4'
    const framesOutputDir = '/tmp/frames'
    const frames = 5

    await extractFrames({ frames, inputFile, framesOutputDir })

    // Ensure exec is NOT called (vulnerability removed)
    expect(childProcess.exec).not.toHaveBeenCalled()

    expect(childProcess.execFile).toHaveBeenCalledTimes(2)

    // Check for ffprobe call
    expect(childProcess.execFile).toHaveBeenCalledWith(
      'ffprobe',
      [
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        inputFile
      ],
      expect.any(Function)
    )

    // Check for ffmpeg call
    // 10 sec duration, 5 frames -> frameRate = 0.5
    const expectedFrameRate = 0.5

    expect(childProcess.execFile).toHaveBeenCalledWith(
      'ffmpeg',
      [
        '-i', inputFile,
        '-vf', `fps=${expectedFrameRate}`,
        '-frames:v', '5',
        '-q:v', '2',
        path.join(framesOutputDir, 'frame_%03d.jpg'),
        '-loglevel', 'error'
      ],
      expect.any(Function)
    )
  })
})
