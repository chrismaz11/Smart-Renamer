/* eslint-env jest */
const path = require('path')
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

const createDirent = (name, type) => ({
  name,
  isFile: () => type === 'file',
  isDirectory: () => type === 'directory',
  isSymbolicLink: () => type === 'symlink'
})

describe('processDirectory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should process files and subdirectories using Dirent optimization', async () => {
    // Setup for optimized implementation (readdir returns Dirents)
    fs.readdir.mockImplementation(async (dirPath, options) => {
      expect(options).toEqual({ withFileTypes: true })

      if (dirPath.endsWith('subDir')) {
        return [createDirent('file2.txt', 'file')]
      }
      return [
        createDirent('file1.txt', 'file'),
        createDirent('subDir', 'directory'),
        createDirent('link.txt', 'symlink')
      ]
    })

    fs.stat.mockImplementation(async (filePath) => {
      // Should only be called for symlink
      const name = path.basename(filePath)
      if (name === 'link.txt') {
        return { isFile: () => true, isDirectory: () => false }
      }
      throw new Error('Unexpected stat call for ' + filePath)
    })

    processFile.mockResolvedValue({ oldName: 'old', newName: 'new' })

    const options = { includeSubdirectories: true }
    const result = await processDirectory({ options, inputPath: '/root' })

    expect(fs.readdir).toHaveBeenCalledWith('/root', { withFileTypes: true })

    // Check that stat was ONLY called for the symlink
    expect(fs.stat).toHaveBeenCalledTimes(1)
    expect(fs.stat).toHaveBeenCalledWith(expect.stringContaining('link.txt'))

    // Check that processFile was called for file1, file2 (in subDir), and link.txt (resolved to file)
    expect(processFile).toHaveBeenCalledTimes(3)

    // Result should contain 3 entries
    expect(result).toHaveLength(3)
  })
})
