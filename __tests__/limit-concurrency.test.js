/* eslint-env jest */
const limitConcurrency = require('../src/utils/limit-concurrency')

describe('limitConcurrency', () => {
  test('should process all items', async () => {
    const items = [1, 2, 3, 4, 5]
    const results = await limitConcurrency(items, 2, async (item) => {
      return item * 2
    })
    expect(results).toEqual([2, 4, 6, 8, 10])
  })

  test('should respect concurrency limit', async () => {
    let running = 0
    let maxRunning = 0
    const items = [1, 2, 3, 4, 5]

    await limitConcurrency(items, 2, async () => {
      running++
      maxRunning = Math.max(maxRunning, running)
      await new Promise(resolve => setTimeout(resolve, 10))
      running--
      return true
    })

    expect(maxRunning).toBeLessThanOrEqual(2)
  })

  test('should handle errors gracefully', async () => {
    const items = [1, 2, 3]
    try {
      await limitConcurrency(items, 2, async (item) => {
        if (item === 2) throw new Error('fail')
        return item
      })
    } catch (error) {
      expect(error.message).toBe('fail')
    }
  })

  test('should return results in order', async () => {
    const items = [100, 50, 10]
    const results = await limitConcurrency(items, 2, async (ms) => {
      await new Promise(resolve => setTimeout(resolve, ms))
      return ms
    })
    expect(results).toEqual([100, 50, 10])
  })
})
