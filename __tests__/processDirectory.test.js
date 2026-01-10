const processDirectory = require('../src/processDirectory')
const fs = require('fs').promises
const path = require('path')

// Mock dependencies
jest.mock('fs', () => ({
  promises: {
    readdir: jest.fn(),
    stat: jest.fn()
  }
}))

jest.mock('../src/processFile', () => jest.fn())
const processFile = require('../src/processFile')

describe('processDirectory recursion', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should handle nested directories without deadlock', async () => {
    // Structure:
    // root/
    //   file1.txt
    //   subdir/
    //     file2.txt

    fs.readdir.mockImplementation(async (dirPath) => {
      if (dirPath === 'root') return ['file1.txt', 'subdir']
      if (dirPath === 'root/subdir') return ['file2.txt']
      return []
    })

    fs.stat.mockImplementation(async (filePath) => {
      if (filePath.endsWith('subdir')) {
        return { isFile: () => false, isDirectory: () => true }
      }
      return { isFile: () => true, isDirectory: () => false }
    })

    processFile.mockImplementation(async ({ filePath }) => {
      return { oldName: filePath, newName: filePath + '.renamed' }
    })

    const options = { includeSubdirectories: true }
    const result = await processDirectory({ options, inputPath: 'root' })

    expect(result).toHaveLength(2)
    expect(processFile).toHaveBeenCalledTimes(2)
    expect(processFile).toHaveBeenCalledWith(expect.objectContaining({ filePath: 'root/file1.txt' }))
    expect(processFile).toHaveBeenCalledWith(expect.objectContaining({ filePath: 'root/subdir/file2.txt' }))
  })

  test('should respect concurrency limit', async () => {
     // Create many files to trigger the limit
     const fileCount = 10
     const files = Array.from({ length: fileCount }, (_, i) => `file${i}.txt`)

     fs.readdir.mockResolvedValue(files)
     fs.stat.mockResolvedValue({ isFile: () => true, isDirectory: () => false })

     let activeCount = 0
     let maxActiveCount = 0

     processFile.mockImplementation(async () => {
        activeCount++
        maxActiveCount = Math.max(maxActiveCount, activeCount)
        await new Promise(resolve => setTimeout(resolve, 10))
        activeCount--
        return null
     })

     await processDirectory({ options: {}, inputPath: 'root' })

     // The limit is hardcoded to 5 in processDirectory.js
     expect(maxActiveCount).toBeLessThanOrEqual(5)
  })
})
