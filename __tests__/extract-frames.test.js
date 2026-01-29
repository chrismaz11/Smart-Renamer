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
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should use execFile instead of exec for security', async () => {
    // Mock execFile to simulate success
    childProcess.execFile.mockImplementation((file, args, cb) => {
      // Handle the callback which is the last argument usually, or 3rd if no options
      const callback = typeof args === 'function' ? args : cb

      if (file === 'ffprobe') {
        callback(null, '10.0') // 10 seconds duration
      } else if (file === 'ffmpeg') {
        callback(null, '')
      }
    })

    const options = {
      frames: 5,
      inputFile: 'video.mp4',
      framesOutputDir: 'output_frames'
    }

    await extractFrames(options)

    // Check that exec was NOT called (we want to move away from it)
    expect(childProcess.exec).not.toHaveBeenCalled()

    // Check that execFile WAS called
    expect(childProcess.execFile).toHaveBeenCalledTimes(2)

    // Verify ffprobe calls
    // args: ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', 'video.mp4']
    expect(childProcess.execFile).toHaveBeenNthCalledWith(1,
      'ffprobe',
      ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', 'video.mp4'],
      expect.any(Function)
    )

    // Verify ffmpeg calls
    // frames=5, duration=10 -> frameRate = 0.5. frameInterval = 2.
    // args should follow the command structure
    // ffmpeg -i video.mp4 -vf fps=0.5 -frames:v 5 -q:v 2 output_frames/frame_%03d.jpg -loglevel error
    expect(childProcess.execFile).toHaveBeenNthCalledWith(2,
      'ffmpeg',
      [
        '-i', 'video.mp4',
        '-vf', 'fps=0.5',
        '-frames:v', '5', // execFile args must be strings!
        '-q:v', '2',
        path.join('output_frames', 'frame_%03d.jpg'),
        '-loglevel', 'error'
      ],
      expect.any(Function)
    )
  })

  test('should handle errors from execFile', async () => {
    childProcess.execFile.mockImplementation((file, args, cb) => {
      cb(new Error('Command failed'))
    })

    const options = {
      frames: 5,
      inputFile: 'video.mp4',
      framesOutputDir: 'output_frames'
    }

    await expect(extractFrames(options)).rejects.toThrow()
  })
})
