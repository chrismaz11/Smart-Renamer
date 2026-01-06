const changeCase = require('../src/utils/change-case')

describe('changeCase', () => {
  it('should return the text in kebabCase', () => {
    return expect(changeCase({ text: 'two words', _case: 'kebabCase' })).resolves.toBe('two-words')
  })

  it('should return the text in camelCase', () => {
    return expect(changeCase({ text: 'two words', _case: 'camelCase' })).resolves.toBe('twoWords')
  })

  it('should return the text in pascalCase', () => {
    return expect(changeCase({ text: 'two words', _case: 'pascalCase' })).resolves.toBe('TwoWords')
  })

  it('should return the text in snakeCase', () => {
    return expect(changeCase({ text: 'two words', _case: 'snakeCase' })).resolves.toBe('two_words')
  })
})
