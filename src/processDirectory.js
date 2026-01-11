const path = require('path')
const fs = require('fs').promises

const processFile = require('./processFile')

const { limitConcurrency } = require('./utils')

const processDirectory = async ({ options, inputPath }) => {
  try {
    const files = await fs.readdir(inputPath)
    const processItem = async (file) => {
      const filePath = path.join(inputPath, file)
      const fileStats = await fs.stat(filePath)
      if (fileStats.isFile()) {
        return await processFile({ ...options, filePath })
      } else if (fileStats.isDirectory() && options.includeSubdirectories) {
        return await processDirectory({ options, inputPath: filePath })
      }
    }

    const results = await limitConcurrency(files, 5, processItem)
    const renamedFiles = results.flat().filter(Boolean)

    return renamedFiles
  } catch (err) {
    console.log(err.message)
  }
}

module.exports = processDirectory
