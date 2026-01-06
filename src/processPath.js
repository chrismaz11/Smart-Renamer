const fs = require('fs').promises

const logger = require('./logger')
const chooseModel = require('./chooseModel')
const processFile = require('./processFile')
const processDirectory = require('./processDirectory')

module.exports = async (options) => {
  try {
    logger.info(`Provider: ${options.provider}`)
    if (options.apiKey) {
      logger.info('API key: **********')
    }
    logger.info(`Base URL: ${options.baseURL}`)

    const model = options.model || await chooseModel({ baseURL: options.baseURL, provider: options.provider })
    logger.info(`Model: ${model}`)

    logger.info(`Frames: ${options.frames}`)
    logger.info(`Case: ${options._case}`)
    logger.info(`Chars: ${options.chars}`)
    logger.info(`Language: ${options.language}`)
    logger.info(`Include subdirectories: ${options.includeSubdirectories}`)

    if (options.customPrompt) {
      logger.info(`Custom Prompt: ${options.customPrompt}`)
    }

    logger.divider()

    const stats = await fs.stat(options.inputPath)
    const newOptions = {
      ...options,
      model
    }

    if (stats.isDirectory()) {
      return await processDirectory({ options: newOptions, inputPath: options.inputPath })
    } else if (stats.isFile()) {
      const result = await processFile({ ...newOptions, filePath: options.inputPath })
      return result ? [result] : []
    }
  } catch (err) {
    logger.error(err.message)
  }
}
