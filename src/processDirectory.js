const path = require('path')
const fs = require('fs').promises

const processFile = require('./processFile')
const { limitConcurrency } = require('./utils')

const processDirectory = async ({ options, inputPath }) => {
  try {
    const files = await fs.readdir(inputPath)
    const limit = 5

    const results = await limitConcurrency(files, limit, async file => {
      const filePath = path.join(inputPath, file)
      const fileStats = await fs.stat(filePath)
      if (fileStats.isFile()) {
        return processFile({ ...options, filePath })
      } else if (fileStats.isDirectory() && options.includeSubdirectories) {
        return processDirectory({ options, inputPath: filePath })
      }
    })

    const renamedFiles = results.flat().filter(Boolean)
    return renamedFiles
  } catch (err) {
    console.log(err.message)
  }
}

module.exports = processDirectory
