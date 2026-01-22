/** @jest-environment node */
/* eslint-env jest */
const limitConcurrency = require('../src/utils/limit-concurrency')

test('limitConcurrency processes all items in order', async () => {
  const items = [1, 2, 3, 4, 5]
  const fn = async (item) => item * 2
  const results = await limitConcurrency(items, 2, fn)
  expect(results).toEqual([2, 4, 6, 8, 10])
})

test('limitConcurrency respects concurrency limit', async () => {
  const items = [100, 100, 100, 100, 100]
  let active = 0
  let maxActive = 0
  const fn = async (ms) => {
    active++
    maxActive = Math.max(maxActive, active)
    await new Promise(resolve => setTimeout(resolve, ms))
    active--
    return ms
  }
  await limitConcurrency(items, 2, fn)
  expect(maxActive).toBeLessThanOrEqual(2)
})
