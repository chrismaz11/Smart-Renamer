/** @jest-environment node */
/* eslint-env jest */
const limitConcurrency = require('../src/utils/limit-concurrency')

describe('limitConcurrency', () => {
  it('should process all items', async () => {
    const items = [1, 2, 3, 4, 5]
    const processed = await limitConcurrency(items, async (item) => item * 2, 2)
    expect(processed).toEqual([2, 4, 6, 8, 10])
  })

  it('should respect concurrency limit', async () => {
    const items = [1, 2, 3, 4, 5]
    let concurrent = 0
    let maxConcurrent = 0

    await limitConcurrency(items, async () => {
      concurrent++
      maxConcurrent = Math.max(maxConcurrent, concurrent)
      await new Promise(resolve => setTimeout(resolve, 10))
      concurrent--
    }, 2)

    expect(maxConcurrent).toBeLessThanOrEqual(2)
  })

  it('should maintain order', async () => {
    const items = [20, 10, 30, 1, 15]
    const processed = await limitConcurrency(items, async (ms) => {
      await new Promise(resolve => setTimeout(resolve, ms))
      return ms
    }, 2)
    expect(processed).toEqual([20, 10, 30, 1, 15])
  })
})
