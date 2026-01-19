const path = require('path')
const fs = require('fs').promises

const processFile = require('./processFile')
const { limitConcurrency } = require('./utils')

const processDirectory = async ({ options, inputPath }) => {
  try {
    const renamedFiles = []
    const entries = await fs.readdir(inputPath, { withFileTypes: true })
    const files = []
    const directories = []

    for (const entry of entries) {
      if (entry.isFile()) {
        files.push(entry)
      } else if (entry.isDirectory()) {
        directories.push(entry)
      }
    }

    const processedFiles = await limitConcurrency(files, async (fileEntry) => {
      const filePath = path.join(inputPath, fileEntry.name)
      return processFile({ ...options, filePath })
    }, 5)

    renamedFiles.push(...processedFiles.filter(Boolean))

    if (options.includeSubdirectories) {
      for (const dirEntry of directories) {
        const filePath = path.join(inputPath, dirEntry.name)
        const renamedSubFiles = await processDirectory({ options, inputPath: filePath })
        if (renamedSubFiles && renamedSubFiles.length > 0) {
          renamedFiles.push(...renamedSubFiles)
        }
      }
    }

    return renamedFiles
  } catch (err) {
    console.log(err.message)
    return []
  }
}

module.exports = processDirectory
