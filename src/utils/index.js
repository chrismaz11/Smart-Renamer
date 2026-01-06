const changeCase = require('./change-case')
const deleteDirectory = require('./delete-directory')
const extractFrames = require('./extract-frames')
const isImage = require('./is-image')
const isProcessableFile = require('./is-processable-file')
const isVideo = require('./is-video')
const readFileContent = require('./read-file-content')
const saveFile = require('./save-file')
const supportedExtensions = require('./supported-extensions')

module.exports = {
  changeCase,
  deleteDirectory,
  extractFrames,
  isImage,
  isProcessableFile,
  isVideo,
  readFileContent,
  saveFile,
  supportedExtensions
}
