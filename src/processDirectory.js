const path = require('path')
const fs = require('fs').promises

const processFile = require('./processFile')
const { limitConcurrency } = require('./utils')

const processDirectory = async ({ options, inputPath }) => {
  try {
    const limit = limitConcurrency(5)
    const files = await fs.readdir(inputPath, { withFileTypes: true })
    const promises = files.map(file => {
      const filePath = path.join(inputPath, file.name)
      if (file.isFile()) {
        return limit(() => processFile({ ...options, filePath }))
      } else if (file.isDirectory() && options.includeSubdirectories) {
        return limit(async () => {
          const result = await processDirectory({ options, inputPath: filePath })
          return result || []
        })
      }
      return Promise.resolve()
    })

    const results = await Promise.all(promises)
    return results.flat().filter(Boolean)
  } catch (err) {
    console.log(err.message)
    return []
  }
}

module.exports = processDirectory
