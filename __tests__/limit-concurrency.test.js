/** @jest-environment node */
/* eslint-env jest */
const limitConcurrency = require('../src/utils/limit-concurrency')

describe('limitConcurrency', () => {
  test('should limit the number of concurrent executions', async () => {
    const limit = limitConcurrency(2)
    let active = 0
    let maxActive = 0

    const task = async () => {
      active++
      maxActive = Math.max(maxActive, active)
      await new Promise(resolve => setTimeout(resolve, 10))
      active--
      return 'done'
    }

    const promises = []
    for (let i = 0; i < 5; i++) {
      promises.push(limit(task))
    }

    await Promise.all(promises)

    expect(maxActive).toBe(2)
  })

  test('should return results in order', async () => {
    const limit = limitConcurrency(2)
    const task = (id) => async () => {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 20))
      return id
    }

    const promises = []
    for (let i = 0; i < 5; i++) {
      promises.push(limit(task(i)))
    }

    const results = await Promise.all(promises)

    expect(results).toEqual([0, 1, 2, 3, 4])
  })

  test('should handle rejections', async () => {
    const limit = limitConcurrency(2)
    const task = async () => { throw new Error('boom') }

    await expect(limit(task)).rejects.toThrow('boom')
  })
})
