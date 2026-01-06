const logger = require('./logger')
const providers = require('./providers')

const filterModelNames = arr => {
  return arr.map((item) => {
    if (item.id !== undefined) {
      return { name: item.id }
    } else if (item.name !== undefined) {
      return { name: item.name }
    } else {
      throw new Error('Item does not contain id or name property')
    }
  })
}

const chooseModel = ({ models }) => {
  const preferredModels = [
    'llava',
    'llama',
    'gemma',
    'phi',
    'qwen',
    'aya',
    'mistral',
    'mixtral',
    'deepseek-coder'
  ]

  for (const modelName of preferredModels) {
    if (models.some(model => model.name.toLowerCase().includes(modelName))) {
      return models.find(model => model.name.toLowerCase().includes(modelName)).name
    }
  }

  return models.length > 0 ? models[0].name : null
}

module.exports = async options => {
  try {
    const { provider } = options
    const providerModule = providers[provider]

    if (!providerModule) {
      throw new Error('No supported provider found')
    }

    const _models = await providerModule.listModels(options)
    const models = filterModelNames(_models)
    logger.info(`Available models: ${models.map(m => m.name).join(', ')}`)

    const model = await chooseModel({ models })
    if (!model) throw new Error('No suitable model found')

    return model
  } catch (err) {
    throw new Error(err.message)
  }
}
