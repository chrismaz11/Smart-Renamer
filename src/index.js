#!/usr/bin/env node

const logger = require('./logger')
const processPath = require('./processPath')
const configureYargs = require('./configureYargs')

const main = async () => {
  try {
    const { argv } = await configureYargs()
    const [inputPath] = argv._

    if (!inputPath) {
      logger.error('Please provide a file or folder path')
      process.exit(1)
    }

    await processPath({ inputPath })
  } catch (err) {
    logger.error(err.message)
  }
}

main()
