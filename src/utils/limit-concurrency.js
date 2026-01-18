const limitConcurrency = (concurrency) => {
  const queue = []
  let active = 0

  const next = () => {
    if (active >= concurrency || queue.length === 0) return

    active++
    const { fn, resolve, reject } = queue.shift()

    Promise.resolve(fn())
      .then(resolve)
      .catch(reject)
      .finally(() => {
        active--
        next()
      })
  }

  return (fn) => {
    return new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject })
      next()
    })
  }
}

module.exports = limitConcurrency
