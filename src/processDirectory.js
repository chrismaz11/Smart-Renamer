const path = require('path')
const fs = require('fs').promises

const processFile = require('./processFile')
const limitConcurrency = require('./utils/limit-concurrency')

const limit = limitConcurrency(5)

const processDirectory = async ({ options, inputPath }) => {
  try {
    const files = await fs.readdir(inputPath)
    const promises = files.map(async file => {
      const filePath = path.join(inputPath, file)
      const fileStats = await fs.stat(filePath)
      if (fileStats.isFile()) {
        return limit(processFile, { ...options, filePath })
      } else if (fileStats.isDirectory() && options.includeSubdirectories) {
        return processDirectory({ options, inputPath: filePath })
      }
    })

    const results = await Promise.all(promises)
    return results.flat().filter(Boolean)
  } catch (err) {
    console.log(err.message)
    return []
  }
}

module.exports = processDirectory
