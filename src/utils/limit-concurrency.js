const limitConcurrency = (concurrency) => {
  const queue = []
  let activeCount = 0

  const next = () => {
    activeCount--
    if (queue.length > 0) {
      queue.shift()()
    }
  }

  const run = async (fn, ...args) => {
    activeCount++
    const result = (async () => fn(...args))()

    try {
      const res = await result
      return res
    } catch (err) {
      throw err
    } finally {
      next()
    }
  }

  const enqueue = (fn, ...args) => {
    if (activeCount < concurrency) {
      return run(fn, ...args)
    }

    return new Promise((resolve, reject) => {
      queue.push(() => {
        run(fn, ...args).then(resolve).catch(reject)
      })
    })
  }

  return enqueue
}

module.exports = limitConcurrency
