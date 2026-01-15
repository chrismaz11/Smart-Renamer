const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs').promises

const getConfig = require('./src/config')
const processPath = require('./src/processPath')
const { validatePath } = require('./src/utils/security')

let allowedDirectory = null

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('public/index.html')
}

app.whenReady().then(async () => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('open-dialog', async () => {
  const { filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  if (filePaths.length > 0) {
    allowedDirectory = filePaths[0]
  }
  return filePaths[0]
})

ipcMain.handle('process-path', async (event, options) => {
  if (!validatePath(allowedDirectory, options.inputPath)) {
    throw new Error('Unauthorized path access')
  }
  const config = await getConfig()
  const newOptions = { ...config, ...options }
  return await processPath(newOptions)
})

ipcMain.handle('read-directory', async (event, { directoryPath }) => {
  if (!validatePath(allowedDirectory, directoryPath)) {
    throw new Error('Unauthorized path access')
  }
  const files = await fs.readdir(directoryPath)
  return files
})
