const path = require('path')
const fs = require('fs').promises
const limitConcurrency = require('./utils/limitConcurrency')

const processFile = require('./processFile')
const limit = limitConcurrency(5)

const processDirectory = async ({ options, inputPath }) => {
  try {
    const files = await fs.readdir(inputPath)

    const tasks = files.map(async (file) => {
      const filePath = path.join(inputPath, file)
      const fileStats = await fs.stat(filePath)

      if (fileStats.isFile()) {
        // Only limit the expensive file processing
        return limit(() => processFile({ ...options, filePath }))
      } else if (fileStats.isDirectory() && options.includeSubdirectories) {
        // Do not limit recursion to avoid deadlock
        return processDirectory({ options, inputPath: filePath })
      }
    })

    const results = await Promise.all(tasks)

    // Flatten results as processDirectory returns an array
    const renamedFiles = results.flat().filter(Boolean)
    return renamedFiles
  } catch (err) {
    console.log(err.message)
    return []
  }
}

module.exports = processDirectory
