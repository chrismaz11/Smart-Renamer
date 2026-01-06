const path = require('path')
const { v4: uuidv4 } = require('uuid')

const logger = require('./logger')
const getNewName = require('./getNewName')
const {
  isImage,
  isVideo,
  saveFile,
  extractFrames,
  readFileContent,
  deleteDirectory,
  isProcessableFile
} = require('./utils')

module.exports = async options => {
  try {
    const { frames, filePath, inputPath } = options

    const ext = path.extname(filePath).toLowerCase()
    const relativeFilePath = path.relative(inputPath, filePath)

    if (!isProcessableFile({ filePath })) {
      logger.warn(`Unsupported file: ${relativeFilePath}`)
      return
    }

    let content
    let videoPrompt
    let images = []
    let framesOutputDir
    if (isImage({ ext })) {
      images.push(filePath)
    } else if (isVideo({ ext })) {
      framesOutputDir = `/tmp/ai-renamer/${uuidv4()}`
      const _extractedFrames = await extractFrames({
        frames,
        framesOutputDir,
        inputFile: filePath
      })
      images = _extractedFrames.images
      videoPrompt = _extractedFrames.videoPrompt
    } else {
      content = await readFileContent({ filePath })
      if (!content) {
        logger.error(`No text content: ${relativeFilePath}`)
        return
      }
    }

    const newName = await getNewName({ ...options, images, content, videoPrompt, relativeFilePath })
    if (!newName) return

    const newFileName = await saveFile({ ext, newName, filePath })
    const relativeNewFilePath = path.join(path.dirname(relativeFilePath), newFileName)
    logger.success(`Renamed: ${relativeFilePath} to ${relativeNewFilePath}`)

    if (isVideo({ ext }) && framesOutputDir) {
      await deleteDirectory({ folderPath: framesOutputDir })
    }

    return { oldName: relativeFilePath, newName: relativeNewFilePath }
  } catch (err) {
    logger.error(err.message)
  }
}
