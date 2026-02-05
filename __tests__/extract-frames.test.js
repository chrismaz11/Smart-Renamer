/* eslint-env jest */
const { execFile } = require('child_process')
const extractFrames = require('../src/utils/extract-frames')

jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined)
  }
}))

jest.mock('child_process', () => ({
  execFile: jest.fn((file, args, cb) => {
    // Mock ffprobe duration output
    if (file === 'ffprobe') {
      cb(null, '10.0') // 10 seconds duration
    } else {
      cb(null, '')
    }
  })
}))

describe('extractFrames Security', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('security: uses execFile with argument array', async () => {
    const maliciousFile = 'video"; echo "hacked.mp4'
    const framesOutputDir = '/tmp/frames'

    await extractFrames({
      frames: 5,
      inputFile: maliciousFile,
      framesOutputDir
    })

    // Verify execFile was called for ffprobe
    expect(execFile).toHaveBeenNthCalledWith(1,
      'ffprobe',
      expect.arrayContaining([maliciousFile]),
      expect.any(Function)
    )

    // Verify execFile was called for ffmpeg
    expect(execFile).toHaveBeenNthCalledWith(2,
      'ffmpeg',
      expect.arrayContaining([maliciousFile]),
      expect.any(Function)
    )

    // Ensure the array contains the raw filename, not quoted or escaped
    const ffprobeArgs = execFile.mock.calls[0][1]
    const ffmpegArgs = execFile.mock.calls[1][1]

    expect(ffprobeArgs).toContain(maliciousFile)
    expect(ffmpegArgs).toContain(maliciousFile)
  })
})
