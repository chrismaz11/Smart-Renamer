/* eslint-env jest */
const fs = require('fs').promises
const path = require('path')
const processDirectory = require('../src/processDirectory')

// Mock processFile
jest.mock('../src/processFile', () => jest.fn(() => Promise.resolve({ renamed: true })))
const processFile = require('../src/processFile')

describe('processDirectory', () => {
  const testDir = path.join(__dirname, 'temp-process-dir')

  beforeEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true })
    } catch {}
    await fs.mkdir(testDir, { recursive: true })
  })

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true })
    jest.clearAllMocks()
  })

  test('processes files and subdirectories correctly', async () => {
    await fs.writeFile(path.join(testDir, 'file1.txt'), 'content')
    await fs.mkdir(path.join(testDir, 'subdir'))
    await fs.writeFile(path.join(testDir, 'subdir', 'file2.txt'), 'content')

    // Create symlinks
    try {
      // Create absolute paths for symlink targets to be safe
      await fs.symlink(path.join(testDir, 'file1.txt'), path.join(testDir, 'symlink_to_file'))
      await fs.symlink(path.join(testDir, 'subdir'), path.join(testDir, 'symlink_to_dir'))
    } catch (e) {
      console.warn('Skipping symlink test due to environment error', e)
    }

    const options = {
      includeSubdirectories: true
    }

    await processDirectory({ options, inputPath: testDir })

    // Check file1.txt
    expect(processFile).toHaveBeenCalledWith(expect.objectContaining({
      filePath: path.join(testDir, 'file1.txt')
    }))

    // Check subdir/file2.txt
    expect(processFile).toHaveBeenCalledWith(expect.objectContaining({
      filePath: path.join(testDir, 'subdir', 'file2.txt')
    }))

    // Check symlink_to_file
    const symlinkExists = await fs.access(path.join(testDir, 'symlink_to_file')).then(() => true).catch(() => false)
    if (symlinkExists) {
      expect(processFile).toHaveBeenCalledWith(expect.objectContaining({
        filePath: path.join(testDir, 'symlink_to_file')
      }))
    }
  })
})
