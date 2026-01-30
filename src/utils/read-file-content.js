const path = require('path')
const pdf = require('pdf-parse')
const fs = require('fs').promises

module.exports = async ({ filePath, maxLength }) => {
  try {
    const ext = path.extname(filePath).toLowerCase()

    let content = ''
    if (ext === '.pdf') {
      const dataBuffer = await fs.readFile(filePath)
      const pdfData = await pdf(dataBuffer)
      content = pdfData.text.trim()
    } else {
      if (maxLength && maxLength > 0) {
        const fileHandle = await fs.open(filePath, 'r')
        try {
          const buffer = Buffer.alloc(maxLength)
          const { bytesRead } = await fileHandle.read(buffer, 0, maxLength, 0)
          content = buffer.toString('utf8', 0, bytesRead)
        } finally {
          await fileHandle.close()
        }
      } else {
        content = await fs.readFile(filePath, 'utf8')
      }
    }

    return content
  } catch (err) {
    throw new Error(err.message)
  }
}
