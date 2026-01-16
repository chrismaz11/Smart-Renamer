/**
 * Limits the concurrency of async operations.
 * @param {number} concurrency - The maximum number of concurrent operations.
 * @returns {function} - A function that accepts a task (function returning a promise) and executes it within the concurrency limit.
 */
const limitConcurrency = (concurrency) => {
  const queue = []
  let activeCount = 0

  const next = () => {
    activeCount--
    if (queue.length > 0) {
      const { fn, resolve, reject, args } = queue.shift()
      run(fn, resolve, reject, args)
    }
  }

  const run = async (fn, resolve, reject, args) => {
    activeCount++
    try {
      const result = await fn(...args)
      resolve(result)
    } catch (error) {
      reject(error)
    } finally {
      next()
    }
  }

  return (fn, ...args) => {
    return new Promise((resolve, reject) => {
      if (activeCount < concurrency) {
        run(fn, resolve, reject, args)
      } else {
        queue.push({ fn, resolve, reject, args })
      }
    })
  }
}

module.exports = limitConcurrency
