/* eslint-env jest */

const path = require('path')
const { validatePath } = require('../src/utils/security')

describe('Security Utils - validatePath', () => {
  const allowedDir = path.resolve('/users/me/projects')

  test('should return true for the allowed directory itself', () => {
    expect(validatePath(allowedDir, allowedDir)).toBe(true)
  })

  test('should return true for a file inside the allowed directory', () => {
    const target = path.join(allowedDir, 'file.txt')
    expect(validatePath(allowedDir, target)).toBe(true)
  })

  test('should return true for a subdirectory', () => {
    const target = path.join(allowedDir, 'subdir')
    expect(validatePath(allowedDir, target)).toBe(true)
  })

  test('should return true for a file deep inside', () => {
    const target = path.join(allowedDir, 'subdir/deep/file.txt')
    expect(validatePath(allowedDir, target)).toBe(true)
  })

  test('should return false if allowedDir is null', () => {
    expect(validatePath(null, '/some/path')).toBe(false)
  })

  test('should return false for parent directory', () => {
    const target = path.resolve(allowedDir, '..')
    expect(validatePath(allowedDir, target)).toBe(false)
  })

  test('should return false for sibling directory', () => {
    const target = path.resolve(allowedDir, '../other-project')
    expect(validatePath(allowedDir, target)).toBe(false)
  })

  test('should return false for root directory', () => {
    expect(validatePath(allowedDir, '/')).toBe(false)
  })

  test('should return false for path traversal attempts using ..', () => {
    // This resolves to the same directory if 'projects' matches, but physically it traversed out.
    // path.resolve normalizes it.
    // path.join('/users/me/projects', '../projects/file.txt') -> '/users/me/projects/file.txt'
    // So this IS allowed because it resolves to inside.

    // A real traversal attack:
    const attack = path.join(allowedDir, '../../../../etc/passwd')
    expect(validatePath(allowedDir, attack)).toBe(false)
  })

  test('should handle windows drive letters correctly if applicable', () => {
    // Checking that different roots are rejected
    if (process.platform === 'win32') {
      expect(validatePath('C:\\Users', 'D:\\Users')).toBe(false)
    }
  })
})
