const path = require('path')
const processDirectory = require('../src/processDirectory')
const processFile = require('../src/processFile')

jest.mock('../src/processFile')
jest.mock('fs', () => {
  const originalModule = jest.requireActual('fs')

  // Mock promises API
  return {
    ...originalModule,
    promises: {
      ...originalModule.promises,
      readdir: jest.fn(),
      stat: jest.fn()
    }
  }
})

const fs = require('fs').promises

describe('processDirectory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    processFile.mockResolvedValue({ oldName: 'old', newName: 'new' })
  })

  it('should process files in directory', async () => {
    fs.readdir.mockResolvedValue([
      { name: 'file1.txt', isFile: () => true, isDirectory: () => false, isSymbolicLink: () => false },
      { name: 'file2.txt', isFile: () => true, isDirectory: () => false, isSymbolicLink: () => false }
    ])

    const result = await processDirectory({
      options: {},
      inputPath: '/test/path'
    })

    expect(fs.readdir).toHaveBeenCalledWith('/test/path', { withFileTypes: true })
    expect(processFile).toHaveBeenCalledTimes(2)
    expect(result).toHaveLength(2)
  })

  it('should process subdirectories recursively', async () => {
    fs.readdir.mockImplementation(async (dirPath) => {
      if (dirPath === '/test/path') {
        return [
          { name: 'sub', isFile: () => false, isDirectory: () => true, isSymbolicLink: () => false },
          { name: 'file1.txt', isFile: () => true, isDirectory: () => false, isSymbolicLink: () => false }
        ]
      } else if (dirPath === path.join('/test/path', 'sub')) {
        return [
          { name: 'subfile.txt', isFile: () => true, isDirectory: () => false, isSymbolicLink: () => false }
        ]
      }
      return []
    })

    const result = await processDirectory({
      options: { includeSubdirectories: true },
      inputPath: '/test/path'
    })

    expect(fs.readdir).toHaveBeenCalledWith('/test/path', { withFileTypes: true })
    expect(fs.readdir).toHaveBeenCalledWith(path.join('/test/path', 'sub'), { withFileTypes: true })
    expect(processFile).toHaveBeenCalledTimes(2)
    expect(result).toHaveLength(2)
  })

  it('should follow symbolic links to files', async () => {
    fs.readdir.mockResolvedValue([
      { name: 'link-to-file', isFile: () => false, isDirectory: () => false, isSymbolicLink: () => true }
    ])

    fs.stat.mockResolvedValue({
      isFile: () => true,
      isDirectory: () => false
    })

    await processDirectory({
      options: {},
      inputPath: '/test/path'
    })

    expect(fs.stat).toHaveBeenCalledWith(path.join('/test/path', 'link-to-file'))
    expect(processFile).toHaveBeenCalledTimes(1)
  })

  it('should follow symbolic links to directories', async () => {
    fs.readdir.mockImplementation(async (dirPath) => {
        if (dirPath === '/test/path') {
             return [{ name: 'link-to-dir', isFile: () => false, isDirectory: () => false, isSymbolicLink: () => true }]
        } else if (dirPath === path.join('/test/path', 'link-to-dir')) {
             return [{ name: 'file-in-link.txt', isFile: () => true, isDirectory: () => false, isSymbolicLink: () => false }]
        }
        return []
    })

    fs.stat.mockImplementation(async (filePath) => {
        if (filePath === path.join('/test/path', 'link-to-dir')) {
            return {
                isFile: () => false,
                isDirectory: () => true
            }
        }
        throw new Error('ENOENT')
    })

    await processDirectory({
      options: { includeSubdirectories: true },
      inputPath: '/test/path'
    })

    expect(fs.stat).toHaveBeenCalledWith(path.join('/test/path', 'link-to-dir'))
    expect(processFile).toHaveBeenCalledTimes(1)
  })

  it('should ignore broken symbolic links', async () => {
     fs.readdir.mockResolvedValue([
      { name: 'broken-link', isFile: () => false, isDirectory: () => false, isSymbolicLink: () => true }
    ])

    fs.stat.mockRejectedValue(new Error('ENOENT'))

    await processDirectory({
      options: {},
      inputPath: '/test/path'
    })

    expect(fs.stat).toHaveBeenCalledWith(path.join('/test/path', 'broken-link'))
    expect(processFile).not.toHaveBeenCalled()
  })

  it('should handle errors gracefully and return empty array', async () => {
    fs.readdir.mockRejectedValue(new Error('Permission denied'))

    const result = await processDirectory({
      options: {},
      inputPath: '/test/path'
    })

    expect(result).toEqual([])
  })
})
