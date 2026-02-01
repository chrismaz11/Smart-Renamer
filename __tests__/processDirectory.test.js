/* eslint-env jest */
const processDirectory = require('../src/processDirectory')
const fs = require('fs').promises
const path = require('path')
const processFile = require('../src/processFile')

jest.mock('fs', () => ({
  promises: {
    readdir: jest.fn(),
    stat: jest.fn()
  }
}))
jest.mock('../src/processFile')

const mockDirent = (name, type) => ({
  name,
  isFile: () => type === 'file',
  isDirectory: () => type === 'directory',
  isSymbolicLink: () => type === 'symlink'
})

describe('processDirectory', () => {
  const inputPath = '/test/dir'
  const options = { includeSubdirectories: true }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should process files in the directory', async () => {
    // Mock readdir to return Dirent objects
    fs.readdir.mockResolvedValue([
      mockDirent('file1.txt', 'file'),
      mockDirent('file2.jpg', 'file')
    ])

    processFile.mockResolvedValue({ oldName: 'old', newName: 'new' })

    const result = await processDirectory({ options, inputPath })

    expect(fs.readdir).toHaveBeenCalledWith(inputPath, { withFileTypes: true })
    // fs.stat should NOT be called for regular files now
    expect(fs.stat).not.toHaveBeenCalled()

    expect(processFile).toHaveBeenCalledTimes(2)
    expect(processFile).toHaveBeenCalledWith(expect.objectContaining({
      filePath: path.join(inputPath, 'file1.txt')
    }))
    expect(processFile).toHaveBeenCalledWith(expect.objectContaining({
      filePath: path.join(inputPath, 'file2.jpg')
    }))
    expect(result).toHaveLength(2)
  })

  it('should recurse into subdirectories if includeSubdirectories is true', async () => {
    // Top level: 1 file, 1 dir
    fs.readdir.mockImplementation(async (p) => {
      if (p === inputPath) {
        return [
          mockDirent('file1.txt', 'file'),
          mockDirent('subdir', 'directory')
        ]
      }
      if (p.endsWith('subdir')) {
        return [mockDirent('subfile.txt', 'file')]
      }
      return []
    })

    processFile.mockResolvedValue({ oldName: 'old', newName: 'new' })

    const result = await processDirectory({ options: { includeSubdirectories: true }, inputPath })

    expect(fs.readdir).toHaveBeenCalledTimes(2)
    expect(fs.readdir).toHaveBeenCalledWith(inputPath, { withFileTypes: true })
    expect(fs.readdir).toHaveBeenCalledWith(path.join(inputPath, 'subdir'), { withFileTypes: true })

    expect(processFile).toHaveBeenCalledTimes(2)
    expect(result).toHaveLength(2)
  })

  it('should not recurse into subdirectories if includeSubdirectories is false', async () => {
    // Top level: 1 file, 1 dir
    fs.readdir.mockResolvedValue([
      mockDirent('file1.txt', 'file'),
      mockDirent('subdir', 'directory')
    ])

    processFile.mockResolvedValue({ oldName: 'old', newName: 'new' })

    const result = await processDirectory({ options: { includeSubdirectories: false }, inputPath })

    expect(fs.readdir).toHaveBeenCalledTimes(1)
    expect(processFile).toHaveBeenCalledTimes(1)
    expect(result).toHaveLength(1)
  })

  it('should handle symbolic links by falling back to fs.stat', async () => {
    // 1 symlink
    fs.readdir.mockResolvedValue([
      mockDirent('link_to_file', 'symlink')
    ])

    fs.stat.mockResolvedValue({
      isFile: () => true,
      isDirectory: () => false
    })

    processFile.mockResolvedValue({ oldName: 'old', newName: 'new' })

    const result = await processDirectory({ options, inputPath })

    expect(fs.readdir).toHaveBeenCalledWith(inputPath, { withFileTypes: true })
    expect(fs.stat).toHaveBeenCalledWith(path.join(inputPath, 'link_to_file'))
    expect(processFile).toHaveBeenCalledTimes(1)
    expect(result).toHaveLength(1)
  })
})
