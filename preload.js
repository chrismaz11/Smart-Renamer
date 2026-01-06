const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  openDialog: () => ipcRenderer.invoke('open-dialog'),
  processPath: (options) => ipcRenderer.invoke('process-path', options),
  readDirectory: (options) => ipcRenderer.invoke('read-directory', options)
})
