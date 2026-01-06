const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  openDialog: () => ipcRenderer.invoke('open-dialog'),
  getPreview: (options) => ipcRenderer.invoke('get-preview', options),
  applyChanges: (options) => ipcRenderer.invoke('apply-changes', options),
  organizeFiles: (options) => ipcRenderer.invoke('organize-files', options),
  undo: () => ipcRenderer.invoke('undo')
})
