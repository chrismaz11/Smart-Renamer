/* eslint-env jest */
const extractFrames = require('../src/utils/extract-frames')
const childProcess = require('child_process')

jest.mock('child_process')
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined)
  }
}))

describe('extractFrames', () => {
  const inputFile = 'video; rm -rf /; .mp4'
  const framesOutputDir = '/tmp/frames'
  const frames = 5

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should use execFile to safely execute ffprobe and ffmpeg', async () => {
    // Mock execFile implementation to return success
    childProcess.execFile.mockImplementation((file, args, callback) => {
      if (file === 'ffprobe') {
        // Return duration of 10 seconds
        callback(null, '10.0')
      } else if (file === 'ffmpeg') {
        callback(null, '')
      } else {
        callback(new Error('Unknown command'))
      }
    })

    // We also need to mock exec because the current implementation uses it.
    // This allows us to verify the current implementation fails this test (because it uses exec not execFile)
    // or we can just proceed to fix it.
    // But since I am replacing exec with execFile, the test will only pass after the fix.
    childProcess.exec.mockImplementation((command, callback) => {
      // Mock for current implementation to avoid crashes if we were to run it now,
      // but strictly we expect execFile.
      if (command.includes('ffprobe')) {
        callback(null, '10.0')
      } else {
        callback(null, '')
      }
    })

    await extractFrames({ frames, inputFile, framesOutputDir })

    // Verify ffprobe call
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

    // Verify ffmpeg call
    // Duration = 10, frames = 5. numFrames = 5. frameRate = 0.5.

    expect(childProcess.execFile).toHaveBeenCalledWith(
      'ffmpeg',
      [
        '-i', inputFile,
        '-vf', 'fps=0.5',
        '-frames:v', '5',
        '-q:v', '2',
        expect.stringContaining('frame_%03d.jpg'),
        '-loglevel', 'error'
      ],
      expect.any(Function)
    )
  })
})
