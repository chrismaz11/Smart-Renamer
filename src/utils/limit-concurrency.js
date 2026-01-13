/**
 * Processes items from an array with a concurrency limit.
 * @param {Array} items - The array of items to process.
 * @param {number} limit - The maximum number of concurrent operations.
 * @param {Function} fn - The async function to apply to each item.
 * @returns {Promise<Array>} - A promise that resolves to an array of results.
 */
const limitConcurrency = async (items, limit, fn) => {
  const results = []
  const executing = []

  for (const item of items) {
    // Wrap fn(item) to ensure it doesn't reject the whole batch
    const p = Promise.resolve().then(async () => {
      try {
        return await fn(item)
      } catch (err) {
        console.error(err)
        return null // Return null on error so other items proceed
      }
    })

    results.push(p)

    if (limit > 0) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1))
      executing.push(e)

      if (executing.length >= limit) {
        await Promise.race(executing)
      }
    }
  }

  return Promise.all(results)
}

module.exports = limitConcurrency
