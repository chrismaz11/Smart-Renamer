const changeCase = require('../src/utils/change-case')

describe('changeCase', () => {
  it('should return the text in kebabCase', async () => {
    const result = await changeCase({ text: 'two words', _case: 'kebabCase' })
    expect(result).toBe('two-words')
  })

  it('should return the text in camelCase', async () => {
    const result = await changeCase({ text: 'two words', _case: 'camelCase' })
    expect(result).toBe('twoWords')
  })

  it('should return the text in pascalCase', async () => {
    const result = await changeCase({ text: 'two words', _case: 'pascalCase' })
    expect(result).toBe('TwoWords')
  })

  it('should return the text in snakeCase', async () => {
    const result = await changeCase({ text: 'two words', _case: 'snakeCase' })
    expect(result).toBe('two_words')
  })
})
