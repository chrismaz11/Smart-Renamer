/* eslint-env jest */
const fs = require('fs').promises
const path = require('path')
const processDirectory = require('../src/processDirectory')
const processFile = require('../src/processFile')

jest.mock('fs', () => ({
  promises: {
    readdir: jest.fn(),
    stat: jest.fn()
  }
}))

jest.mock('../src/processFile')

const makeDirent = (name, isFile, isDirectory, isSymbolicLink = false) => ({
  name,
  isFile: () => isFile,
  isDirectory: () => isDirectory,
  isSymbolicLink: () => isSymbolicLink
})

describe('processDirectory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should process files in a directory', async () => {
    fs.readdir.mockResolvedValue([
      makeDirent('file1.txt', true, false),
      makeDirent('file2.jpg', true, false)
    ])

    processFile.mockResolvedValue({ oldName: 'old', newName: 'new' })

    const results = await processDirectory({ options: {}, inputPath: '/test' })

    expect(results).toHaveLength(2)
    expect(processFile).toHaveBeenCalledTimes(2)
  })

  it('should recurse into subdirectories if enabled', async () => {
    fs.readdir.mockImplementation(async (p, opts) => {
      // Check if opts includes withFileTypes: true, which it should
      if (p === '/test') {
        return [
          makeDirent('file1.txt', true, false),
          makeDirent('subdir', false, true)
        ]
      }
      if (p === path.join('/test', 'subdir')) {
        return [makeDirent('file2.jpg', true, false)]
      }
      return []
    })

    processFile.mockResolvedValue({ oldName: 'old', newName: 'new' })

    const results = await processDirectory({
      options: { includeSubdirectories: true },
      inputPath: '/test'
    })

    expect(results).toHaveLength(2)
    expect(processFile).toHaveBeenCalledTimes(2)
  })

  it('should NOT recurse into subdirectories if disabled', async () => {
    fs.readdir.mockResolvedValue([
      makeDirent('file1.txt', true, false),
      makeDirent('subdir', false, true)
    ])

    processFile.mockResolvedValue({ oldName: 'old', newName: 'new' })

    const results = await processDirectory({
      options: { includeSubdirectories: false },
      inputPath: '/test'
    })

    expect(results).toHaveLength(1)
  })

  it('should handle symbolic links by resolving them', async () => {
    // Helper for symbolic link test
    const symlinkDirent = makeDirent('link', false, false, true)

    fs.readdir.mockResolvedValue([symlinkDirent])

    // when checking symlink, it calls fs.stat
    fs.stat.mockResolvedValue({
      isFile: () => true,
      isDirectory: () => false
    })

    processFile.mockResolvedValue({ oldName: 'old', newName: 'new' })

    const results = await processDirectory({ options: {}, inputPath: '/test' })

    expect(fs.stat).toHaveBeenCalledWith(path.join('/test', 'link'))
    expect(results).toHaveLength(1)
  })
})
