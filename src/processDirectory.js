const path = require('path')
const fs = require('fs').promises

const processFile = require('./processFile')
const { limitConcurrency } = require('./utils')

const processDirectory = async ({ options, inputPath }) => {
  try {
    const files = await fs.readdir(inputPath)
    // Limit concurrency to 5 to prevent resource exhaustion and API rate limits
    const limit = limitConcurrency(5)

    const promises = files.map(file => {
      return limit(async () => {
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
      })
    })

    const results = await Promise.all(promises)
    return results.flat()
  } catch (err) {
    console.log(err.message)
    return []
  }
}

module.exports = processDirectory
