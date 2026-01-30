/* eslint-env jest */
const fs = require('fs')
const path = require('path')
const readFileContent = require('../src/utils/read-file-content')

const TEST_DIR = path.join(__dirname, 'temp_read_test')

describe('read-file-content', () => {
  beforeAll(() => {
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR)
    }
  })

  afterAll(() => {
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true })
    }
  })

  test('reads small file completely by default', async () => {
    const filePath = path.join(TEST_DIR, 'small.txt')
    const content = 'Hello World'
    fs.writeFileSync(filePath, content)

    const result = await readFileContent({ filePath })
    expect(result).toBe(content)
  })

  test('reads large file completely by default', async () => {
    const filePath = path.join(TEST_DIR, 'large_full.txt')
    const chunk = 'a'.repeat(1000)
    const content = chunk.repeat(30) // 30KB
    fs.writeFileSync(filePath, content)

    const result = await readFileContent({ filePath })
    expect(result.length).toBe(30000)
    expect(result).toBe(content)
  })

  test('truncates large file when maxLength is provided', async () => {
    const filePath = path.join(TEST_DIR, 'large_truncated.txt')
    const chunk = 'a'.repeat(1000)
    const content = chunk.repeat(30) // 30KB
    fs.writeFileSync(filePath, content)

    const result = await readFileContent({ filePath, maxLength: 20000 })
    expect(result.length).toBe(20000)
    expect(result).toBe(content.slice(0, 20000))
  })

  test('handles empty file', async () => {
    const filePath = path.join(TEST_DIR, 'empty.txt')
    fs.writeFileSync(filePath, '')

    const result = await readFileContent({ filePath })
    expect(result).toBe('')
  })
})
