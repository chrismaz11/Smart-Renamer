const path = require('path')
const fs = require('fs').promises
const limitConcurrency = require('./utils/limitConcurrency')

const processFile = require('./processFile')

const processDirectory = async ({ options, inputPath }) => {
  try {
    const files = await fs.readdir(inputPath)

    const processItem = async (file) => {
      const filePath = path.join(inputPath, file)
      const fileStats = await fs.stat(filePath)
      if (fileStats.isFile()) {
        const renamedFile = await processFile({ ...options, filePath })
        return renamedFile ? [renamedFile] : []
      } else if (fileStats.isDirectory() && options.includeSubdirectories) {
        const renamedSubFiles = await processDirectory({ options, inputPath: filePath })
        return renamedSubFiles || []
      }
      return []
    }

    const results = await limitConcurrency(files, 5, processItem)
    return results.flat()
  } catch (err) {
    console.log(err.message)
    return []
  }
}

module.exports = processDirectory
