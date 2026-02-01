/* eslint-env jest */
const { execFile, exec } = require('child_process')
const extractFrames = require('../src/utils/extract-frames')

jest.mock('child_process', () => {
  return {
    exec: jest.fn((cmd, cb) => cb(null, '10.0')),
    execFile: jest.fn((file, args, cb) => cb(null, '10.0'))
  }
})

jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue()
  }
}))

describe('extractFrames', () => {
  const inputFile = 'test_video.mp4'
  const framesOutputDir = 'frames_output'
  const frames = 5

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should use execFile with array arguments to prevent command injection', async () => {
    await extractFrames({ frames, inputFile, framesOutputDir })

    // Verify ffprobe call via execFile
    expect(execFile).toHaveBeenCalledWith(
      'ffprobe',
      expect.arrayContaining(['-v', 'error', '-show_entries', 'format=duration', expect.stringContaining(inputFile)]),
      expect.any(Function)
    )

    // Verify ffmpeg call via execFile
    expect(execFile).toHaveBeenCalledWith(
      'ffmpeg',
      expect.arrayContaining(['-i', inputFile, '-vf', expect.stringContaining('fps='), '-frames:v', expect.any(String), expect.stringContaining('frame_%03d.jpg')]),
      expect.any(Function)
    )

    // Verify exec is NOT called
    expect(exec).not.toHaveBeenCalled()
  })
})
