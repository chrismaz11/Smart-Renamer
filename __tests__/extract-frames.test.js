/* eslint-env jest */
const extractFrames = require('../src/utils/extract-frames')
const { execFile } = require('child_process')

jest.mock('child_process', () => ({
  execFile: jest.fn((cmd, args, cb) => cb(null, '10.0'))
}))

jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue()
  }
}))

describe('extractFrames', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('calls execFile with array arguments (secure) and strings', async () => {
    const inputFile = 'video"; rm -rf /; ".mp4'
    await extractFrames({
      frames: 5,
      inputFile,
      framesOutputDir: '/tmp/output'
    })

    expect(execFile).toHaveBeenCalledTimes(2)

    // First call is ffprobe
    const ffprobeCall = execFile.mock.calls[0]
    expect(ffprobeCall[0]).toBe('ffprobe')
    expect(Array.isArray(ffprobeCall[1])).toBe(true)
    // Verify the inputFile is passed as a distinct argument, without extra quotes
    expect(ffprobeCall[1]).toContain(inputFile)

    // Second call is ffmpeg
    const ffmpegCall = execFile.mock.calls[1]
    expect(ffmpegCall[0]).toBe('ffmpeg')
    expect(Array.isArray(ffmpegCall[1])).toBe(true)
    expect(ffmpegCall[1]).toContain(inputFile)

    // Check that all arguments are strings (critical for execFile)
    ffmpegCall[1].forEach(arg => {
      expect(typeof arg).toBe('string')
    })
  })
})
