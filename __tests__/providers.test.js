/* eslint-env jest */
const axios = require('axios')
const providers = require('../src/providers')

jest.mock('axios')

describe('providers', () => {
  it('should return a list of models for ollama', async () => {
    axios.mockResolvedValue({ data: { models: [{ name: 'llava' }] } })
    const models = await providers.ollama.listModels({ baseURL: 'http://127.0.0.1:11434' })
    expect(Array.isArray(models)).toBe(true)
  })

  it('should return a list of models for lm-studio', async () => {
    axios.mockResolvedValue({ data: { data: [{ id: 'gemma' }] } })
    const models = await providers['lm-studio'].listModels({ baseURL: 'http://127.0.0.1:1234' })
    expect(Array.isArray(models)).toBe(true)
  })

  it('should return a list of models for openai', async () => {
    const models = await providers.openai.listModels()
    expect(Array.isArray(models)).toBe(true)
  })
})
