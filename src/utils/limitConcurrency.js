const limitConcurrency = async (items, limit, fn) => {
  const results = []
  const executing = []

  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item))
    results.push(p)

    const e = p.then(() => executing.splice(executing.indexOf(e), 1))
    executing.push(e)

    if (executing.length >= limit) {
      await Promise.race(executing)
    }
  }

  return Promise.all(results)
}

module.exports = limitConcurrency
