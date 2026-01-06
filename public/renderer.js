const selectFolderBtn = document.getElementById('select-folder')
const renameFilesBtn = document.getElementById('rename-files')
const fileExplorer = document.getElementById('file-explorer')
const previewPanel = document.getElementById('preview-panel')
const providerSelect = document.getElementById('provider')
const modelInput = document.getElementById('model')
const caseSelect = document.getElementById('case')

let selectedFolderPath

selectFolderBtn.addEventListener('click', async () => {
    const folderPath = await window.electron.openDialog()
    selectedFolderPath = folderPath
    const files = await window.electron.readDirectory({ directoryPath: folderPath })
    fileExplorer.innerHTML = files.map(file => `<div>${file}</div>`).join('')
})

renameFilesBtn.addEventListener('click', async () => {
    if (selectedFolderPath) {
        previewPanel.innerHTML = 'Renaming files...'
        const options = {
            inputPath: selectedFolderPath,
            provider: providerSelect.value,
            model: modelInput.value,
            _case: caseSelect.value
        }
        const renamedFiles = await window.electron.processPath(options)
        previewPanel.innerHTML = renamedFiles.map(file => `<div>${file.oldName} -> ${file.newName}</div>`).join('')
    }
})
