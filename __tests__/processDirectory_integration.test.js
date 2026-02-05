/* eslint-env jest */
const fs = require('fs')
const path = require('path')
const processDirectory = require('../src/processDirectory')

// Mock processFile
jest.mock('../src/processFile', () => {
  return jest.fn().mockImplementation(async ({ filePath }) => {
    return { oldName: filePath, newName: filePath + '.renamed' }
  })
})

describe('processDirectory Integration', () => {
  const testDir = path.join(__dirname, 'temp_correctness_test')

  beforeAll(async () => {
    if (fs.existsSync(testDir)) {
      await fs.promises.rm(testDir, { recursive: true, force: true })
    }
    await fs.promises.mkdir(testDir)

    // Create files
    await fs.promises.writeFile(path.join(testDir, 'file1.txt'), 'content')
    await fs.promises.writeFile(path.join(testDir, 'file2.txt'), 'content')

    // Create subdirectory
    const subDir = path.join(testDir, 'subdir')
    await fs.promises.mkdir(subDir)
    await fs.promises.writeFile(path.join(subDir, 'subfile1.txt'), 'content')

    // Create symlink to file
    const symlinkFile = path.join(testDir, 'link_to_file1.txt')
    try {
      await fs.promises.symlink(path.join(testDir, 'file1.txt'), symlinkFile)
    } catch (e) {
      console.log('Skipping symlink creation')
    }
  })

  afterAll(async () => {
    if (fs.existsSync(testDir)) {
      await fs.promises.rm(testDir, { recursive: true, force: true })
    }
  })

  test('should process files and subdirectories correctly', async () => {
    const options = { includeSubdirectories: true }
    const results = await processDirectory({ options, inputPath: testDir })

    const processedPaths = results.map(r => r.oldName)

    // Check files
    expect(processedPaths.some(p => p.includes('file1.txt'))).toBe(true)
    expect(processedPaths.some(p => p.includes('file2.txt'))).toBe(true)

    // Check subdirectory
    expect(processedPaths.some(p => p.includes('subfile1.txt'))).toBe(true)

    // Check symlink (if created)
    const symlinkCreated = fs.existsSync(path.join(testDir, 'link_to_file1.txt'))
    if (symlinkCreated) {
      expect(processedPaths.some(p => p.includes('link_to_file1.txt'))).toBe(true)
    }
  })
})
