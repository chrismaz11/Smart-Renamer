/* eslint-env jest */
const extractFrames = require('../src/utils/extract-frames')

jest.mock('child_process', () => ({
  exec: jest.fn((cmd, cb) => cb(null, '10.0')),
  execFile: jest.fn()
}))

jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue()
  }
}))

describe('extractFrames Security', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should use execFile instead of exec to prevent command injection', async () => {
    const maliciousFile = 'video"; rm -rf /; ".mp4'
    const framesOutputDir = '/tmp/frames'
    const { execFile } = require('child_process')

    // Mock implementation for execFile to handle both calls (when the fix is applied)
    execFile.mockImplementation((cmd, args, cb) => {
      if (cmd === 'ffprobe') {
        cb(null, '10.0')
      } else if (cmd === 'ffmpeg') {
        cb(null, '')
      }
    })

    await extractFrames({
      frames: 5,
      inputFile: maliciousFile,
      framesOutputDir
    })

    // Verify ffprobe was called with execFile
    expect(execFile).toHaveBeenCalledWith(
      'ffprobe',
      expect.arrayContaining(['-v', 'error', maliciousFile]),
      expect.any(Function)
    )

    // Verify ffmpeg was called with execFile
    expect(execFile).toHaveBeenCalledWith(
      'ffmpeg',
      expect.arrayContaining(['-i', maliciousFile]),
      expect.any(Function)
    )
  })
})
