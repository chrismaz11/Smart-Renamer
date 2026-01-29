/* eslint-env jest */
const processDirectory = require('../src/processDirectory')
const fs = require('fs').promises
const processFile = require('../src/processFile')

jest.mock('fs', () => ({
  promises: {
    readdir: jest.fn(),
    stat: jest.fn()
  }
}))

jest.mock('../src/processFile')

describe('processDirectory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should process files in the directory without calling stat for regular files', async () => {
    const inputPath = '/test/dir'
    const entries = [
      { name: 'file1.txt', isFile: () => true, isDirectory: () => false, isSymbolicLink: () => false },
      { name: 'file2.jpg', isFile: () => true, isDirectory: () => false, isSymbolicLink: () => false }
    ]

    fs.readdir.mockResolvedValue(entries)
    processFile.mockResolvedValue('renamed_file')

    const result = await processDirectory({ options: {}, inputPath })

    expect(fs.readdir).toHaveBeenCalledWith(inputPath, { withFileTypes: true })
    expect(fs.stat).not.toHaveBeenCalled() // Optimization: stat should not be called
    expect(processFile).toHaveBeenCalledTimes(2)
    expect(result).toHaveLength(2)
  })

  it('should recursively process directories if includeSubdirectories is true', async () => {
    const inputPath = '/test/dir'

    fs.readdir.mockImplementation(async (path, options) => {
      if (path === '/test/dir') {
        return [{
          name: 'subdir',
          isFile: () => false,
          isDirectory: () => true,
          isSymbolicLink: () => false
        }]
      }
      if (path === '/test/dir/subdir') {
        return [{
          name: 'file.txt',
          isFile: () => true,
          isDirectory: () => false,
          isSymbolicLink: () => false
        }]
      }
      return []
    })

    processFile.mockResolvedValue('renamed_file')

    await processDirectory({
      options: { includeSubdirectories: true },
      inputPath
    })

    expect(fs.readdir).toHaveBeenCalledWith('/test/dir', { withFileTypes: true })
    expect(fs.readdir).toHaveBeenCalledWith('/test/dir/subdir', { withFileTypes: true })
    expect(processFile).toHaveBeenCalledTimes(1)
  })

  it('should fallback to fs.stat for symbolic links', async () => {
    const inputPath = '/test/dir'
    const entries = [
      {
        name: 'symlink_to_file',
        isFile: () => false,
        isDirectory: () => false,
        isSymbolicLink: () => true
      }
    ]

    fs.readdir.mockResolvedValue(entries)
    fs.stat.mockResolvedValue({
      isFile: () => true,
      isDirectory: () => false
    })
    processFile.mockResolvedValue('renamed_file')

    const result = await processDirectory({ options: {}, inputPath })

    expect(fs.readdir).toHaveBeenCalledWith(inputPath, { withFileTypes: true })
    expect(fs.stat).toHaveBeenCalledWith('/test/dir/symlink_to_file')
    expect(processFile).toHaveBeenCalledTimes(1)
    expect(result).toHaveLength(1)
  })
})
