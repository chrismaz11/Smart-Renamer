/* eslint-env jest */
const processDirectory = require('../src/processDirectory')
const processFile = require('../src/processFile')
const fs = require('fs').promises

jest.mock('../src/processFile')
jest.mock('fs', () => ({
  promises: {
    readdir: jest.fn(),
    stat: jest.fn()
  }
}))

describe('processDirectory', () => {
  const options = { includeSubdirectories: true }
  const inputPath = '/test/path'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should process files concurrently', async () => {
    fs.readdir.mockResolvedValue(['file1.txt', 'file2.txt'])
    fs.stat.mockResolvedValue({ isFile: () => true, isDirectory: () => false })
    processFile.mockImplementation(async ({ filePath }) => ({ oldName: filePath, newName: filePath + '.new' }))

    const results = await processDirectory({ options, inputPath })

    expect(fs.readdir).toHaveBeenCalledWith(inputPath)
    expect(processFile).toHaveBeenCalledTimes(2)
    expect(results).toHaveLength(2)
    expect(results).toEqual(expect.arrayContaining([
      { oldName: '/test/path/file1.txt', newName: '/test/path/file1.txt.new' },
      { oldName: '/test/path/file2.txt', newName: '/test/path/file2.txt.new' }
    ]))
  })

  test('should handle subdirectories', async () => {
    fs.readdir.mockImplementation(async (path) => {
      if (path === '/test/path') return ['subdir']
      if (path === '/test/path/subdir') return ['file3.txt']
      return []
    })
    fs.stat.mockImplementation(async (path) => {
      if (path.includes('subdir') && !path.endsWith('.txt')) {
        return { isFile: () => false, isDirectory: () => true }
      }
      return { isFile: () => true, isDirectory: () => false }
    })
    processFile.mockResolvedValue({ oldName: 'file', newName: 'file.new' })

    const results = await processDirectory({ options, inputPath })

    expect(processFile).toHaveBeenCalledTimes(1)
    expect(results).toHaveLength(1)
  })
})
