const path = require('path')
const fs = require('fs').promises

const processFile = require('./processFile')

// Optimizing performance by processing files in batches instead of sequentially.
// A batch size of 5 strikes a balance between performance improvement and avoiding
// potential rate limits (for API calls) or file system limits (EMFILE).
const BATCH_SIZE = 5

const processDirectory = async ({ options, inputPath }) => {
  try {
    const renamedFiles = []
    const files = await fs.readdir(inputPath)

    // Process files in chunks to improve throughput while maintaining stability
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE)

      // Parallelize operations within the current batch
      const results = await Promise.all(batch.map(async (file) => {
        const filePath = path.join(inputPath, file)
        const fileStats = await fs.stat(filePath)

        if (fileStats.isFile()) {
          const renamedFile = await processFile({ ...options, filePath })
          return renamedFile ? [renamedFile] : []
        } else if (fileStats.isDirectory() && options.includeSubdirectories) {
          // Recursive calls will also use batching, ensuring efficient traversal
          const renamedSubFiles = await processDirectory({ options, inputPath: filePath })
          return renamedSubFiles
        }
        return []
      }))

      // Aggregate results from the batch
      results.forEach(res => {
        if (res && res.length > 0) {
          renamedFiles.push(...res)
        }
      })
    }

    return renamedFiles
  } catch (err) {
    console.log(err.message)
  }
}

module.exports = processDirectory
