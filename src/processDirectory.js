const path = require('path')
const fs = require('fs').promises
const { limitConcurrency } = require('./utils')

const processFile = require('./processFile')

const processDirectory = async ({ options, inputPath }) => {
  try {
    const renamedFiles = []
    const files = await fs.readdir(inputPath)

    const fileList = []
    const directoryList = []

    // 1. Separate files and directories to optimize processing
    for (const file of files) {
      const filePath = path.join(inputPath, file)
      const fileStats = await fs.stat(filePath)
      if (fileStats.isFile()) {
        fileList.push(filePath)
      } else if (fileStats.isDirectory()) {
        directoryList.push(filePath)
      }
    }

    // 2. Process files in parallel with concurrency limit
    const processedFiles = await limitConcurrency(fileList, 5, async (filePath) => {
      return processFile({ ...options, filePath })
    })

    // Filter out undefined results (failed or skipped files)
    renamedFiles.push(...processedFiles.filter(Boolean))

    // 3. Process subdirectories sequentially to manage depth
    if (options.includeSubdirectories) {
      for (const dirPath of directoryList) {
        const renamedSubFiles = await processDirectory({ options, inputPath: dirPath })
        if (renamedSubFiles && renamedSubFiles.length > 0) {
          renamedFiles.push(...renamedSubFiles)
        }
      }
    }

    return renamedFiles
  } catch (err) {
    console.log(err.message)
    return [] // Return empty array on error to prevent crashes in recursive calls
  }
}

module.exports = processDirectory
