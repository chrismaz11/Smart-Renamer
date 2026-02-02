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

describe('processDirectory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should process files using dirents optimization', async () => {
    const mockDirents = [
      { name: 'file1.txt', isFile: () => true, isDirectory: () => false, isSymbolicLink: () => false },
      { name: 'dir1', isFile: () => false, isDirectory: () => true, isSymbolicLink: () => false }
    ]

    fs.readdir.mockResolvedValue(mockDirents)
    processFile.mockResolvedValue({ oldName: 'old', newName: 'new' })

    const options = { includeSubdirectories: false }
    const inputPath = '/test/dir'

    const result = await processDirectory({ options, inputPath })

    expect(fs.readdir).toHaveBeenCalledWith(inputPath, { withFileTypes: true })
    expect(fs.stat).not.toHaveBeenCalled()

    expect(processFile).toHaveBeenCalledWith(expect.objectContaining({
      filePath: path.join(inputPath, 'file1.txt')
    }))
    expect(result).toHaveLength(1)
  })

  it('should recurse into subdirectories if enabled', async () => {
    const rootDirents = [
      { name: 'dir1', isFile: () => false, isDirectory: () => true, isSymbolicLink: () => false }
    ]
    const subDirents = [
      { name: 'file2.txt', isFile: () => true, isDirectory: () => false, isSymbolicLink: () => false }
    ]

    fs.readdir
      .mockResolvedValueOnce(rootDirents)
      .mockResolvedValueOnce(subDirents)

    processFile.mockResolvedValue({ oldName: 'old', newName: 'new' })

    const options = { includeSubdirectories: true }
    const inputPath = '/test/dir'

    const result = await processDirectory({ options, inputPath })

    expect(fs.readdir).toHaveBeenNthCalledWith(1, inputPath, { withFileTypes: true })
    expect(fs.readdir).toHaveBeenNthCalledWith(2, path.join(inputPath, 'dir1'), { withFileTypes: true })
    expect(result).toHaveLength(1)
  })

  it('should handle symlinks by falling back to stat', async () => {
    const mockDirents = [
      { name: 'link1', isFile: () => false, isDirectory: () => false, isSymbolicLink: () => true }
    ]
    fs.readdir.mockResolvedValue(mockDirents)
    fs.stat.mockResolvedValue({ isFile: () => true, isDirectory: () => false })
    processFile.mockResolvedValue({ oldName: 'old', newName: 'new' })

    const result = await processDirectory({ options: {}, inputPath: '/test/dir' })

    expect(fs.readdir).toHaveBeenCalledWith('/test/dir', { withFileTypes: true })
    expect(fs.stat).toHaveBeenCalledWith(path.join('/test/dir', 'link1'))
    expect(processFile).toHaveBeenCalled()
    expect(result).toHaveLength(1)
  })
})
