/* eslint-env jest */

const processDirectory = require('../src/processDirectory')
const processFile = require('../src/processFile')
const fs = require('fs').promises
const path = require('path')

jest.mock('fs', () => ({
  promises: {
    readdir: jest.fn(),
    stat: jest.fn()
  }
}))

jest.mock('../src/processFile')

describe('processDirectory', () => {
  const options = { includeSubdirectories: true }
  const inputPath = '/test/dir'

  beforeEach(() => {
    jest.clearAllMocks()
    processFile.mockResolvedValue({ oldName: 'old', newName: 'new' })
  })

  it('should process files', async () => {
    // Setup mock for both scenarios
    fs.readdir.mockImplementation(async (p, opts) => {
      if (opts && opts.withFileTypes) {
        return [{ name: 'file1.txt', isFile: () => true, isDirectory: () => false, isSymbolicLink: () => false }]
      }
      return ['file1.txt']
    })
    fs.stat.mockResolvedValue({ isFile: () => true, isDirectory: () => false })

    const result = await processDirectory({ options, inputPath })

    expect(processFile).toHaveBeenCalledWith(expect.objectContaining({ filePath: path.join(inputPath, 'file1.txt') }))
    expect(result).toHaveLength(1)
  })

  it('should recurse into directories', async () => {
    fs.readdir.mockImplementation(async (p, opts) => {
      if (p === inputPath) {
        if (opts?.withFileTypes) {
          return [{ name: 'subdir', isFile: () => false, isDirectory: () => true, isSymbolicLink: () => false }]
        }
        return ['subdir']
      }
      if (p === path.join(inputPath, 'subdir')) {
        if (opts?.withFileTypes) {
          return [{ name: 'subfile.txt', isFile: () => true, isDirectory: () => false, isSymbolicLink: () => false }]
        }
        return ['subfile.txt']
      }
      return []
    })

    fs.stat.mockImplementation(async (p) => {
      if (p.endsWith('subdir')) return { isFile: () => false, isDirectory: () => true }
      if (p.endsWith('subfile.txt')) return { isFile: () => true, isDirectory: () => false }
      return { isFile: () => false, isDirectory: () => false }
    })

    const result = await processDirectory({ options, inputPath })
    expect(processFile).toHaveBeenCalledWith(expect.objectContaining({ filePath: path.join(inputPath, 'subdir', 'subfile.txt') }))
    expect(result).toHaveLength(1)
  })

  it('should handle symbolic links by resolving them', async () => {
    // Logic: readdir returns symlink. Code should check if symlink, then stat it.
    // If stat says file, process it.

    const linkName = 'link-to-file.txt'
    const linkPath = path.join(inputPath, linkName)

    fs.readdir.mockImplementation(async (p, opts) => {
      if (opts?.withFileTypes) {
        return [{ name: linkName, isFile: () => false, isDirectory: () => false, isSymbolicLink: () => true }]
      }
      return [linkName]
    })

    fs.stat.mockResolvedValue({ isFile: () => true, isDirectory: () => false })

    const result = await processDirectory({ options, inputPath })

    // In current implementation: stat is called on everything, so it works.
    // In optimized implementation: isSymbolicLink is true, so stat is called.
    expect(fs.stat).toHaveBeenCalledWith(linkPath)
    expect(processFile).toHaveBeenCalledWith(expect.objectContaining({ filePath: linkPath }))
    expect(result).toHaveLength(1)
  })
})
