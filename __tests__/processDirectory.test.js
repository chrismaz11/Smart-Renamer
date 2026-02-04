/* eslint-env jest */
const fs = require('fs').promises
const path = require('path')
const processDirectory = require('../src/processDirectory')

// Mock processFile to avoid calling AI and just return the file path
jest.mock('../src/processFile', () => {
  return jest.fn(async ({ filePath }) => {
    return { oldName: filePath, newName: filePath + '.renamed' }
  })
})

const processFile = require('../src/processFile')

describe('processDirectory', () => {
  const tempDir = path.join(__dirname, 'temp-test-processDirectory')

  beforeEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true })
    } catch (e) {}
    await fs.mkdir(tempDir, { recursive: true })
  })

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true })
    } catch (e) {}
    jest.clearAllMocks()
  })

  it('should process files in a directory', async () => {
    await fs.writeFile(path.join(tempDir, 'file1.txt'), 'content')
    await fs.writeFile(path.join(tempDir, 'file2.txt'), 'content')

    const options = { includeSubdirectories: false }
    const results = await processDirectory({ options, inputPath: tempDir })

    expect(results).toHaveLength(2)
    expect(processFile).toHaveBeenCalledTimes(2)
  })

  it('should process nested directories when includeSubdirectories is true', async () => {
    await fs.writeFile(path.join(tempDir, 'file1.txt'), 'content')
    await fs.mkdir(path.join(tempDir, 'subdir'))
    await fs.writeFile(path.join(tempDir, 'subdir', 'file2.txt'), 'content')

    const options = { includeSubdirectories: true }
    const results = await processDirectory({ options, inputPath: tempDir })

    expect(results).toHaveLength(2)
    expect(processFile).toHaveBeenCalledTimes(2)
  })

  it('should NOT process nested directories when includeSubdirectories is false', async () => {
    await fs.writeFile(path.join(tempDir, 'file1.txt'), 'content')
    await fs.mkdir(path.join(tempDir, 'subdir'))
    await fs.writeFile(path.join(tempDir, 'subdir', 'file2.txt'), 'content')

    const options = { includeSubdirectories: false }
    const results = await processDirectory({ options, inputPath: tempDir })

    expect(results).toHaveLength(1)
    expect(processFile).toHaveBeenCalledTimes(1)
  })
})
