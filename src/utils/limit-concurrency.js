module.exports = (limit) => {
  const queue = []
  let activeCount = 0

  const next = () => {
    activeCount--
    if (queue.length > 0) {
      const { task, resolve, reject } = queue.shift()
      run(task, resolve, reject)
    }
  }

  const run = async (task, resolve, reject) => {
    activeCount++
    try {
      const result = await task()
      resolve(result)
    } catch (err) {
      reject(err)
    } finally {
      next()
    }
  }

  return (task) => {
    return new Promise((resolve, reject) => {
      if (activeCount < limit) {
        run(task, resolve, reject)
      } else {
        queue.push({ task, resolve, reject })
      }
    })
  }
}
