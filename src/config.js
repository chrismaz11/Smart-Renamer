const configureYargs = require('./configureYargs')

const main = async () => {
  const { config } = await configureYargs()

  const provider = config.defaultProvider || 'ollama'
  const apiKey = config.defaultApiKey
  let baseURL = config.defaultBaseURL

  if (provider === 'ollama' && !baseURL) {
    baseURL = 'http://127.0.0.1:11434'
  } else if (provider === 'lm-studio' && !baseURL) {
    baseURL = 'http://127.0.0.1:1234'
  } else if (provider === 'openai' && !baseURL) {
    baseURL = 'https://api.openai.com'
  }

  const model = config.defaultModel
  const frames = config.defaultFrames || 3
  const _case = config.defaultCase || 'kebabCase'
  const chars = config.defaultChars || 20
  const language = config.defaultLanguage || 'English'
  const includeSubdirectories = config.defaultIncludeSubdirectories === 'true' || false
  const customPrompt = config.defaultCustomPrompt || null

  return {
    provider,
    apiKey,
    baseURL,
    model,
    frames,
    _case,
    chars,
    language,
    includeSubdirectories,
    customPrompt
  }
}

module.exports = main
