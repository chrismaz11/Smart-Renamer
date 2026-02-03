const path = require('path')
const fs = require('fs').promises

const processFile = require('./processFile')

const processDirectory = async ({ options, inputPath }) => {
  try {
    const renamedFiles = []
    const entries = await fs.readdir(inputPath, { withFileTypes: true })
    for (const entry of entries) {
      const filePath = path.join(inputPath, entry.name)

      let isFile = entry.isFile()
      let isDirectory = entry.isDirectory()

      if (entry.isSymbolicLink()) {
        try {
          const fileStats = await fs.stat(filePath)
          isFile = fileStats.isFile()
          isDirectory = fileStats.isDirectory()
        } catch (error) {
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
        if (renamedSubFiles) {
          renamedFiles.push(...renamedSubFiles)
        }
      }
    }
    return renamedFiles
  } catch (err) {
    console.log(err.message)
  }
}

module.exports = processDirectory
