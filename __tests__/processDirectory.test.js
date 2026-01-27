/* eslint-env jest */
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

const fs = require('fs').promises

const createDirent = (name, type) => ({
  name,
  isFile: () => type === 'file',
  isDirectory: () => type === 'dir',
  isSymbolicLink: () => type === 'symlink'
})

describe('processDirectory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    processFile.mockResolvedValue({ oldName: 'old', newName: 'new' })
  })

  it('should process files in a flat directory', async () => {
    fs.readdir.mockResolvedValue([
      createDirent('file1.txt', 'file'),
      createDirent('file2.jpg', 'file')
    ])

    const results = await processDirectory({
      options: {},
      inputPath: '/test/dir'
    })

    expect(fs.readdir).toHaveBeenCalledWith('/test/dir', { withFileTypes: true })
    expect(fs.stat).not.toHaveBeenCalled()
    expect(processFile).toHaveBeenCalledTimes(2)
    expect(results).toHaveLength(2)
  })

  it('should process recursive subdirectories if enabled', async () => {
    fs.readdir.mockImplementation(async (p) => {
      if (p === '/test/dir') return [
        createDirent('file1.txt', 'file'),
        createDirent('subdir', 'dir')
      ]
      if (p === '/test/dir/subdir') return [
        createDirent('file2.txt', 'file')
      ]
      return []
    })

    const results = await processDirectory({
      options: { includeSubdirectories: true },
      inputPath: '/test/dir'
    })

    expect(fs.readdir).toHaveBeenCalledTimes(2)
    expect(processFile).toHaveBeenCalledTimes(2)
    expect(results).toHaveLength(2)
  })

  it('should NOT process subdirectories if disabled', async () => {
    fs.readdir.mockResolvedValue([
      createDirent('file1.txt', 'file'),
      createDirent('subdir', 'dir')
    ])

    const results = await processDirectory({
      options: { includeSubdirectories: false },
      inputPath: '/test/dir'
    })

    expect(processFile).toHaveBeenCalledTimes(1)
    expect(results).toHaveLength(1)
  })

  it('should handle symlinks by checking stat', async () => {
    fs.readdir.mockResolvedValue([
      createDirent('link-to-file', 'symlink')
    ])

    fs.stat.mockResolvedValue({
      isFile: () => true,
      isDirectory: () => false
    })

    const results = await processDirectory({
      options: {},
      inputPath: '/test/dir'
    })

    expect(fs.stat).toHaveBeenCalledWith('/test/dir/link-to-file')
    expect(processFile).toHaveBeenCalledTimes(1)
  })
})
