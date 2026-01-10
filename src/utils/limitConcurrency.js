/**
 * Limits the concurrency of async operations.
 * @param {number} concurrency - The maximum number of concurrent operations.
 * @returns {function} - A function that accepts a task (function returning a promise) and returns a promise.
 */
const limitConcurrency = (concurrency) => {
  const queue = []
  let active = 0

  const next = () => {
    active--
    if (queue.length > 0) {
      const { fn, resolve, reject } = queue.shift()
      run(fn, resolve, reject)
    }
  }

  const run = async (fn, resolve, reject) => {
    active++
    try {
      const result = await fn()
      resolve(result)
    } catch (error) {
      reject(error)
    } finally {
      next()
    }
  }

  return (fn) => new Promise((resolve, reject) => {
    if (active < concurrency) {
      run(fn, resolve, reject)
    } else {
      queue.push({ fn, resolve, reject })
    }
  })
}

module.exports = limitConcurrency
