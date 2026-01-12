module.exports = async (items, limit, fn) => {
  const results = new Array(items.length)
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
