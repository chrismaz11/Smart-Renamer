const limitConcurrency = require('../src/utils/limitConcurrency')

describe('limitConcurrency', () => {
  test('should process all items', async () => {
    const items = [1, 2, 3, 4, 5]
    const fn = async (item) => item * 2
    const results = await limitConcurrency(items, 2, fn)
    expect(results).toEqual([2, 4, 6, 8, 10])
  })

  test('should respect concurrency limit', async () => {
    const items = [1, 2, 3, 4, 5]
    let active = 0
    let maxActive = 0
    const fn = async (item) => {
      active++
      maxActive = Math.max(maxActive, active)
      await new Promise(resolve => setTimeout(resolve, 10))
      active--
      return item
    }
    await limitConcurrency(items, 2, fn)
    expect(maxActive).toBeLessThanOrEqual(2)
  })

  test('should handle empty array', async () => {
    const items = []
    const fn = async (item) => item
    const results = await limitConcurrency(items, 2, fn)
    expect(results).toEqual([])
  })

  test('should handle errors in worker gracefully', async () => {
    // Note: The current implementation will fail Promise.all if one fails.
    // This is expected behavior unless we wrap fn in try-catch.
    const items = [1, 2]
    const fn = async (item) => {
        if (item === 2) throw new Error('fail')
        return item
    }
    await expect(limitConcurrency(items, 2, fn)).rejects.toThrow('fail')
  })
})
