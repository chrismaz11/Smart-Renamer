/* eslint-env jest */
const extractFrames = require('../src/utils/extract-frames')
const childProcess = require('child_process')

jest.mock('child_process')
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue(),
    stat: jest.fn().mockResolvedValue({ isDirectory: () => false })
  }
}))

describe('extractFrames', () => {
  const mockExecFile = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    childProcess.execFile.mockImplementation((file, args, callback) => {
      mockExecFile(file, args)
      // Simulate ffprobe duration output
      if (file === 'ffprobe') {
        callback(null, '10.0')
      } else {
        callback(null, '')
      }
    })
  })

  it('should use execFile with correct arguments (secure behavior)', async () => {
    const options = {
      frames: 5,
      inputFile: 'video file with spaces.mp4',
      framesOutputDir: '/tmp/frames'
    }

    await extractFrames(options)

    // Verify ffprobe call
    expect(mockExecFile).toHaveBeenCalledWith(
      'ffprobe',
      expect.arrayContaining([
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        'video file with spaces.mp4'
      ])
    )

    // Verify ffmpeg call
    expect(mockExecFile).toHaveBeenCalledWith(
      'ffmpeg',
      expect.arrayContaining([
        '-i', 'video file with spaces.mp4',
        '-vf', expect.stringContaining('fps='),
        '-frames:v', '5',
        '-q:v', '2',
        expect.stringContaining('frame_%03d.jpg'),
        '-loglevel', 'error'
      ])
    )
  })
})
