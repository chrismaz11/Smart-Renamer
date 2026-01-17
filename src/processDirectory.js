const path = require('path')
const fs = require('fs').promises

const processFile = require('./processFile')
const { limitConcurrency } = require('./utils')

// Concurrency limit for file processing to avoid rate limits or system overload
const CONCURRENCY_LIMIT = 4

const processDirectory = async ({ options, inputPath }) => {
  try {
    const renamedFiles = []
    const files = await fs.readdir(inputPath)

    // Parallelize stat calls to check file types
    const fileStats = await Promise.all(files.map(async file => {
      const filePath = path.join(inputPath, file)
      const stats = await fs.stat(filePath)
      return { file, filePath, stats }
    }))

    const filesToProcess = fileStats.filter(f => f.stats.isFile())
    const dirsToProcess = fileStats.filter(f => f.stats.isDirectory() && options.includeSubdirectories)

    // Process files with concurrency limit
    const processedFiles = await limitConcurrency(filesToProcess, CONCURRENCY_LIMIT, async ({ filePath }) => {
      return processFile({ ...options, filePath })
    })

    renamedFiles.push(...processedFiles.filter(Boolean))

    // Process directories sequentially to avoid excessive recursion depth/concurrency
    for (const { filePath } of dirsToProcess) {
      const renamedSubFiles = await processDirectory({ options, inputPath: filePath })
      if (renamedSubFiles) {
        renamedFiles.push(...renamedSubFiles)
      }
    }

    return renamedFiles
  } catch (err) {
    console.log(err.message)
    // Return empty array on error to prevent issues in recursive calls or result handling
    return []
  }
}

module.exports = processDirectory
