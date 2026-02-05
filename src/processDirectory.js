const path = require('path')
const fs = require('fs').promises

const processFile = require('./processFile')

const processDirectory = async ({ options, inputPath }) => {
  try {
    const renamedFiles = []
    // Optimization: Use withFileTypes: true to avoid N+1 fs.stat calls.
    // This provides file type information directly in the directory entry.
    const files = await fs.readdir(inputPath, { withFileTypes: true })
    for (const entry of files) {
      const filePath = path.join(inputPath, entry.name)
      let isFile = entry.isFile()
      let isDirectory = entry.isDirectory()

      // Handle symbolic links by falling back to fs.stat to resolve target type
      if (entry.isSymbolicLink()) {
        try {
          const stats = await fs.stat(filePath)
          isFile = stats.isFile()
          isDirectory = stats.isDirectory()
        } catch (err) {
          // Ignore broken symlinks
          continue
        }
      }

      if (isFile) {
        const renamedFile = await processFile({ ...options, filePath })
        if (renamedFile) {
          renamedFiles.push(renamedFile)
        }
      } else if (isDirectory && options.includeSubdirectories) {
        const renamedSubFiles = await processDirectory({ options, inputPath: filePath })
        renamedFiles.push(...renamedSubFiles)
      }
    }
    return renamedFiles
  } catch (err) {
    console.log(err.message)
  }
}

module.exports = processDirectory
