const limitConcurrency = require('../src/utils/limitConcurrency')

describe('limitConcurrency', () => {
  test('should limit concurrency to the specified amount', async () => {
    const limit = limitConcurrency(2)
    let activeCount = 0
    let maxActiveCount = 0

    const task = async () => {
      activeCount++
      maxActiveCount = Math.max(maxActiveCount, activeCount)
      await new Promise(resolve => setTimeout(resolve, 50))
      activeCount--
      return 'done'
    }

    const tasks = Array(5).fill(task)
    await Promise.all(tasks.map(t => limit(t)))

    expect(maxActiveCount).toBe(2)
  })

  test('should return results correctly', async () => {
    const limit = limitConcurrency(2)
    const task = (val) => async () => val

    const results = await Promise.all([
      limit(task(1)),
      limit(task(2)),
      limit(task(3))
    ])

    expect(results).toEqual([1, 2, 3])
  })

  test('should handle rejections', async () => {
    const limit = limitConcurrency(2)
    const task = async () => {
      throw new Error('failed')
    }

    await expect(limit(task)).rejects.toThrow('failed')
  })
})
