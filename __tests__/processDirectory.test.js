/* eslint-env jest */
const fs = require('fs').promises
const path = require('path')
const processDirectory = require('../src/processDirectory')
const processFile = require('../src/processFile')

jest.mock('../src/processFile')

const TEST_DIR = path.join(__dirname, 'test-process-dir')

describe('processDirectory', () => {
  beforeEach(async () => {
    // Create a fresh test directory before each test
    await fs.mkdir(TEST_DIR, { recursive: true })
    // Mock processFile to return a dummy result
    processFile.mockResolvedValue({ oldName: 'old', newName: 'new' })
  })

  afterEach(async () => {
    // Clean up the test directory after each test
    await fs.rm(TEST_DIR, { recursive: true, force: true })
    jest.clearAllMocks()
  })

  test('processes files in directory', async () => {
    await fs.writeFile(path.join(TEST_DIR, 'file1.txt'), 'content')
    await fs.writeFile(path.join(TEST_DIR, 'file2.txt'), 'content')

    const results = await processDirectory({
      options: {},
      inputPath: TEST_DIR
    })

    expect(processFile).toHaveBeenCalledTimes(2)
    // Check if called with correct arguments is a bonus, but verification of traversal is key
    expect(results).toHaveLength(2)
  })

  test('processes subdirectories recursively', async () => {
    await fs.mkdir(path.join(TEST_DIR, 'subdir'))
    await fs.writeFile(path.join(TEST_DIR, 'file1.txt'), 'content')
    await fs.writeFile(path.join(TEST_DIR, 'subdir', 'file2.txt'), 'content')

    const results = await processDirectory({
      options: { includeSubdirectories: true },
      inputPath: TEST_DIR
    })

    expect(processFile).toHaveBeenCalledTimes(2)
    expect(results).toHaveLength(2)
  })

  test('does not process subdirectories if option is false', async () => {
    await fs.mkdir(path.join(TEST_DIR, 'subdir'))
    await fs.writeFile(path.join(TEST_DIR, 'file1.txt'), 'content')
    await fs.writeFile(path.join(TEST_DIR, 'subdir', 'file2.txt'), 'content')

    const results = await processDirectory({
      options: { includeSubdirectories: false },
      inputPath: TEST_DIR
    })

    expect(processFile).toHaveBeenCalledTimes(1)
    expect(results).toHaveLength(1)
  })

  test('handles symbolic links to files', async () => {
    const targetFile = path.join(TEST_DIR, 'target.txt')
    await fs.writeFile(targetFile, 'content')
    const linkPath = path.join(TEST_DIR, 'link.txt')
    try {
      await fs.symlink(targetFile, linkPath)
    } catch (e) {
      // Symlinks might fail on some environments (e.g. Windows without privs), skip if so?
      // But in this environment it should work.
      console.warn('Symlink creation failed', e)
      return
    }

    const results = await processDirectory({
      options: {},
      inputPath: TEST_DIR
    })

    // Should process the target file AND the symlink (because the symlink resolves to a file)
    // So 2 calls.
    expect(processFile).toHaveBeenCalledTimes(2)
    expect(results).toHaveLength(2)
  })
})
