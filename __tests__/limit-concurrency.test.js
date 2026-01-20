/** @jest-environment node */
/* eslint-env jest */

const limitConcurrency = require('../src/utils/limit-concurrency')

describe('limitConcurrency', () => {
  test('should process all items', async () => {
    const items = [1, 2, 3, 4, 5]
    const fn = jest.fn(x => Promise.resolve(x * 2))
    const results = await limitConcurrency(items, 2, fn)
    expect(results).toEqual([2, 4, 6, 8, 10])
    expect(fn).toHaveBeenCalledTimes(5)
  })

  test('should respect concurrency limit', async () => {
    const items = [1, 2, 3, 4, 5]
    let active = 0
    let maxActive = 0

    const fn = async (x) => {
      active++
      maxActive = Math.max(maxActive, active)
      await new Promise(resolve => setTimeout(resolve, 10))
      active--
      return x
    }

    await limitConcurrency(items, 2, fn)
    expect(maxActive).toBeLessThanOrEqual(2)
  })

  test('should maintain order of results', async () => {
    const items = [10, 50, 20, 30, 40] // Delays
    const fn = async (delay) => {
      await new Promise(resolve => setTimeout(resolve, delay))
      return delay
    }

    const results = await limitConcurrency(items, 3, fn)
    expect(results).toEqual([10, 50, 20, 30, 40])
  })

  test('should handle empty array', async () => {
    const results = await limitConcurrency([], 2, async x => x)
    expect(results).toEqual([])
  })
})
