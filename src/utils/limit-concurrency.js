/**
 * Processes items with a concurrency limit.
 * @param {Array} items - Items to process
 * @param {number} limit - Max concurrent operations
 * @param {Function} fn - Async function to run on each item
 * @returns {Promise<Array>} - Array of results
 */
const limitConcurrency = async (items, limit, fn) => {
  const results = []
  const queue = items.map((item, index) => ({ item, index }))

  const worker = async () => {
    while (queue.length > 0) {
      const { item, index } = queue.shift()
      results[index] = await fn(item)
    }
  }

  const workers = Array(Math.min(items.length, limit)).fill(null).map(worker)
  await Promise.all(workers)
  return results
}

module.exports = limitConcurrency
