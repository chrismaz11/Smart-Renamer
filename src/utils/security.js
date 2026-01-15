const path = require('path')

/**
 * Validates if the target path is within the allowed directory.
 * @param {string} allowedDir - The authorized parent directory.
 * @param {string} targetPath - The path to check.
 * @returns {boolean} - True if access is allowed, false otherwise.
 */
function validatePath (allowedDir, targetPath) {
  if (!allowedDir || !targetPath) return false

  // Resolve absolute paths to normalize them (handling ..)
  const resolvedAllowed = path.resolve(allowedDir)
  const resolvedTarget = path.resolve(targetPath)

  // Use path.relative to check containment
  const relative = path.relative(resolvedAllowed, resolvedTarget)

  // If relative path starts with '..' or is absolute (on different drive), it's outside
  return relative === '' ||
         (!relative.startsWith('..') && !path.isAbsolute(relative))
}

module.exports = { validatePath }
