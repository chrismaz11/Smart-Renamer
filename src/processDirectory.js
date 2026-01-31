const path = require('path')
const fs = require('fs').promises

const processFile = require('./processFile')

const processDirectory = async ({ options, inputPath }) => {
  try {
    const renamedFiles = []
    const files = await fs.readdir(inputPath, { withFileTypes: true })
    for (const entry of files) {
      const filePath = path.join(inputPath, entry.name)
      let isFile = entry.isFile()
      let isDirectory = entry.isDirectory()

      if (entry.isSymbolicLink()) {
        const stats = await fs.stat(filePath)
        isFile = stats.isFile()
        isDirectory = stats.isDirectory()
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
