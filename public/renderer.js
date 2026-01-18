const selectFolderBtn = document.getElementById('select-folder')
const renameFilesBtn = document.getElementById('rename-files')
const fileList = document.getElementById('file-list')
const fileCount = document.getElementById('file-count')
const previewPanel = document.getElementById('preview-panel')
const providerSelect = document.getElementById('provider')
const modelInput = document.getElementById('model')
const caseSelect = document.getElementById('case')

let selectedFolderPath

const escapeHtml = (text) => {
  if (!text) return text
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

const renderFileList = (files) => {
  fileCount.textContent = `${files.length} ${files.length === 1 ? 'file' : 'files'}`
  if (files.length === 0) {
    fileList.innerHTML = '<div class="text-gray-400 italic">No files selected.</div>'
    return
  }

  fileList.innerHTML = files.map(file => `
        <div class="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-4 py-3">
            <div>
                <p class="font-medium text-gray-700">${escapeHtml(file)}</p>
                <p class="text-xs text-gray-400">Ready to rename</p>
            </div>
            <button class="text-gray-400 hover:text-gray-600" aria-label="Remove ${escapeHtml(file)}">✕</button>
        </div>
    `).join('')
}

const renderPreview = (renamedFiles) => {
  if (!renamedFiles || renamedFiles.length === 0) {
    previewPanel.innerHTML = '<div class="text-gray-400 italic">Preview changes will appear here.</div>'
    return
  }

  previewPanel.innerHTML = renamedFiles.map(file => `
        <div class="border border-gray-200 rounded-md p-3 bg-gray-50">
            <p class="text-xs text-gray-400">Original</p>
            <p class="font-medium text-gray-700">${escapeHtml(file.oldName)}</p>
            <p class="text-xs text-gray-400 mt-2">New Name</p>
            <p class="font-medium text-gray-700">${escapeHtml(file.newName)}</p>
            ${file.destination ? `<p class="text-xs text-gray-400 mt-2">Destination</p><p class="text-xs text-gray-500">${escapeHtml(file.destination)}</p>` : ''}
        </div>
    `).join('')
}

selectFolderBtn.addEventListener('click', async () => {
  const folderPath = await window.electron.openDialog()
  if (!folderPath) {
    renderFileList([])
    return
  }
  selectedFolderPath = folderPath
  const files = await window.electron.readDirectory({ directoryPath: folderPath })
  renderFileList(files)
})

renameFilesBtn.addEventListener('click', async () => {
  if (selectedFolderPath) {
    previewPanel.innerHTML = '<div class="text-gray-400 italic">Renaming files...</div>'
    const options = {
      inputPath: selectedFolderPath,
      provider: providerSelect.value,
      model: modelInput.value,
      _case: caseSelect.value
    }
    const renamedFiles = await window.electron.processPath(options)
    renderPreview(renamedFiles)
  }
})

renderFileList([])
renderPreview([])
