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

const createDirent = (name, isFile, isDirectory, isSymbolicLink = false) => ({
  name,
  isFile: () => isFile,
  isDirectory: () => isDirectory,
  isSymbolicLink: () => isSymbolicLink
})

describe('processDirectory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should process files in directory', async () => {
    const inputPath = '/test/dir'
    const options = { some: 'option' }

    fs.readdir.mockResolvedValue([
      createDirent('file1.txt', true, false),
      createDirent('file2.jpg', true, false)
    ])

    processFile.mockResolvedValue({ newName: 'renamed' })

    const result = await processDirectory({ options, inputPath })

    expect(fs.readdir).toHaveBeenCalledWith(inputPath, { withFileTypes: true })
    expect(fs.stat).not.toHaveBeenCalled()
    expect(processFile).toHaveBeenCalledTimes(2)
    expect(result).toHaveLength(2)
  })

  test('should recurse into subdirectories if enabled', async () => {
    const inputPath = '/test/dir'
    const options = { includeSubdirectories: true }

    fs.readdir.mockImplementation(async (p, opts) => {
      if (p === '/test/dir') return [createDirent('subdir', false, true)]
      if (p === path.join('/test/dir', 'subdir')) return [createDirent('file.txt', true, false)]
      return []
    })

    processFile.mockResolvedValue({ newName: 'renamed' })

    await processDirectory({ options, inputPath })

    expect(fs.readdir).toHaveBeenCalledWith(inputPath, { withFileTypes: true })
    expect(fs.readdir).toHaveBeenCalledWith(path.join(inputPath, 'subdir'), { withFileTypes: true })
    expect(processFile).toHaveBeenCalledTimes(1)
  })

  test('should handle symbolic links by checking stats', async () => {
    const inputPath = '/test/dir'
    const options = { some: 'option' }

    fs.readdir.mockResolvedValue([
      createDirent('link_to_file', false, false, true)
    ])

    fs.stat.mockResolvedValue({
      isFile: () => true,
      isDirectory: () => false
    })

    processFile.mockResolvedValue({ newName: 'renamed' })

     await processDirectory({ options, inputPath })

    expect(fs.stat).toHaveBeenCalledWith(path.join(inputPath, 'link_to_file'))
    expect(processFile).toHaveBeenCalledTimes(1)
  })
})
