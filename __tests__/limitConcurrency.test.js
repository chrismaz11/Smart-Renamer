/* eslint-env jest */
const limitConcurrency = require('../src/utils/limitConcurrency')

describe('limitConcurrency', () => {
  test('should process items concurrently up to the limit', async () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const limit = 3
    let active = 0
    let maxActive = 0

    const processItem = async (item) => {
      active++
      if (active > maxActive) maxActive = active
      await new Promise(resolve => setTimeout(resolve, 50))
      active--
      return item * 2
    }

    const start = Date.now()
    const results = await limitConcurrency(items, limit, processItem)
    const end = Date.now()

    expect(results).toEqual(items.map(i => i * 2))
    expect(maxActive).toBeLessThanOrEqual(limit)
    // 10 items, limit 3.
    // 3, 3, 3, 1 batches.
    // 50ms per batch. roughly 200ms total.
    // If serial, it would be 500ms.
    expect(end - start).toBeLessThan(500)
  })

  test('should handle empty array', async () => {
    const results = await limitConcurrency([], 5, async (i) => i)
    expect(results).toEqual([])
  })

  test('should propagate errors', async () => {
    const items = [1, 2, 3]
    const processItem = async (item) => {
      if (item === 2) throw new Error('fail')
      return item
    }

    await expect(limitConcurrency(items, 2, processItem)).rejects.toThrow('fail')
  })
})
