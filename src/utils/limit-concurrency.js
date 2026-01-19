const limitConcurrency = async (items, iteratorFn, limit = 5) => {
  const results = []
  const queue = items.map((item, index) => ({ item, index }))
  const workers = new Array(Math.min(limit, items.length)).fill(0).map(async () => {
    while (queue.length > 0) {
      const { item, index } = queue.shift()
      results[index] = await iteratorFn(item)
    }
  })
  await Promise.all(workers)
  return results
}

module.exports = limitConcurrency
