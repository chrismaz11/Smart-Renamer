const path = require('path')
const fs = require('fs').promises
const { limitConcurrency } = require('./utils')

const processFile = require('./processFile')

const processDirectory = async ({ options, inputPath }) => {
  try {
    const files = await fs.readdir(inputPath)

    const results = await limitConcurrency(files, 5, async (file) => {
      const filePath = path.join(inputPath, file)
      const fileStats = await fs.stat(filePath)

      if (fileStats.isFile()) {
        return processFile({ ...options, filePath })
      } else if (fileStats.isDirectory() && options.includeSubdirectories) {
        return processDirectory({ options, inputPath: filePath })
      }
    })

    const renamedFiles = results
      .flat()
      .filter(item => item !== undefined && item !== null)

    return renamedFiles
  } catch (err) {
    console.log(err.message)
    return []
  }
}

module.exports = processDirectory
