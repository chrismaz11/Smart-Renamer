const fs = require('fs').promises

const logger = require('./logger')
const getConfig = require('./config')
const chooseModel = require('./chooseModel')
const processFile = require('./processFile')
const processDirectory = require('./processDirectory')

module.exports = async ({ inputPath }) => {
  try {
    const config = await getConfig()

    logger.info(`Provider: ${config.provider}`)
    if (config.apiKey) {
      logger.info('API key: **********')
    }
    logger.info(`Base URL: ${config.baseURL}`)

    const model = config.model || await chooseModel({ baseURL: config.baseURL, provider: config.provider })
    logger.info(`Model: ${model}`)

    logger.info(`Frames: ${config.frames}`)
    logger.info(`Case: ${config._case}`)
    logger.info(`Chars: ${config.chars}`)
    logger.info(`Language: ${config.language}`)
    logger.info(`Include subdirectories: ${config.includeSubdirectories}`)

    if (config.customPrompt) {
      logger.info(`Custom Prompt: ${config.customPrompt}`)
    }

    logger.divider()

    const stats = await fs.stat(inputPath)
    const options = {
      ...config,
      model,
      inputPath
    }

    if (stats.isDirectory()) {
      await processDirectory({ options, inputPath })
    } else if (stats.isFile()) {
      await processFile({ ...options, filePath: inputPath })
    }
  } catch (err) {
    logger.error(err.message)
  }
}
