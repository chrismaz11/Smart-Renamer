const path = require('path')
const fs = require('fs').promises
const { limitConcurrency } = require('./utils')

const processFile = require('./processFile')

const processDirectory = async ({ options, inputPath }) => {
  try {
    const renamedFiles = []
    const dirents = await fs.readdir(inputPath, { withFileTypes: true })

    const limit = limitConcurrency(5)
    const filePromises = []
    const subDirectories = []

    for (const dirent of dirents) {
      if (dirent.isFile()) {
        const filePath = path.join(inputPath, dirent.name)
        filePromises.push(limit(async () => {
          const renamedFile = await processFile({ ...options, filePath })
          if (renamedFile) {
            renamedFiles.push(renamedFile)
          }
        }))
      } else if (dirent.isDirectory() && options.includeSubdirectories) {
        subDirectories.push(path.join(inputPath, dirent.name))
      }
    }

    // Process files in parallel
    await Promise.all(filePromises)

    // Process subdirectories sequentially
    for (const dirPath of subDirectories) {
      const renamedSubFiles = await processDirectory({ options, inputPath: dirPath })
      if (renamedSubFiles) {
        renamedFiles.push(...renamedSubFiles)
      }
    }

    return renamedFiles
  } catch (err) {
    console.log(err.message)
    return []
  }
}

module.exports = processDirectory
