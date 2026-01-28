/* eslint-env jest */
const extractFrames = require('../src/utils/extract-frames')

jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined)
  }
}))

jest.mock('child_process', () => ({
  exec: jest.fn(),
  execFile: jest.fn()
}))

describe('extractFrames', () => {
  it('should use execFile to prevent command injection', async () => {
    const { exec, execFile } = require('child_process')

    // Mock implementations
    exec.mockImplementation((cmd, cb) => {
        // Simulate success for current implementation so it doesn't crash
        cb(null, '10.0')
    })

    execFile.mockImplementation((file, args, cb) => {
        if (file === 'ffprobe') cb(null, '10.0')
        else cb(null, '')
    })

    const inputFile = 'test"; touch /tmp/pwned; ".mp4'
    const framesOutputDir = '/tmp/output'

    await extractFrames({
      frames: 5,
      inputFile,
      framesOutputDir
    })

    // This assertion expects the secure behavior (which is not implemented yet)
    expect(exec).not.toHaveBeenCalled()
    expect(execFile).toHaveBeenCalledTimes(2)

    expect(execFile).toHaveBeenCalledWith(
      'ffprobe',
      expect.arrayContaining([inputFile]),
      expect.any(Function)
    )

    expect(execFile).toHaveBeenCalledWith(
      'ffmpeg',
      expect.arrayContaining(['-i', inputFile]),
      expect.any(Function)
    )
  })
})
