const path = require('path')
const fs = require('fs').promises
const { limitConcurrency } = require('./utils')

const processFile = require('./processFile')

const processDirectory = async ({ options, inputPath }) => {
  try {
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

    const processFileWrapper = async (entry) => {
      const filePath = path.join(inputPath, entry.name)
      return processFile({ ...options, filePath })
    }

    const processDirWrapper = async (entry) => {
      const filePath = path.join(inputPath, entry.name)
      return processDirectory({ options, inputPath: filePath })
    }

    const renamedFilesResults = await limitConcurrency(files, 5, processFileWrapper)

    // Filter out undefined results (failed renames)
    const renamedFiles = renamedFilesResults.filter(Boolean)

    if (options.includeSubdirectories) {
      const renamedSubFilesResults = await limitConcurrency(directories, 5, processDirWrapper)

      // Flatten and filter, handling potential undefined returns from processDirectory
      renamedSubFilesResults.forEach(subFiles => {
        if (subFiles && Array.isArray(subFiles)) {
          renamedFiles.push(...subFiles)
        }
      })
    }

    return renamedFiles
  } catch (err) {
    console.log(err.message)
    return [] // Return empty array on error to prevent undefined iterator issues
  }
}

module.exports = processDirectory
