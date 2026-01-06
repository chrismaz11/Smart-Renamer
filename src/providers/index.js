const ollama = require('./ollama')
const lmStudio = require('./lm-studio')
const openai = require('./openai')

module.exports = {
  ollama,
  'lm-studio': lmStudio,
  openai
}
