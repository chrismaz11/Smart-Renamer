const selectFolderBtn = document.getElementById('select-folder')
const renameFilesBtn = document.getElementById('rename-files')
const fileList = document.getElementById('file-list')
const fileCount = document.getElementById('file-count')
const previewPanel = document.getElementById('preview-panel')
const providerSelect = document.getElementById('provider')
const modelInput = document.getElementById('model')
const caseSelect = document.getElementById('case')

let selectedFolderPath

const spinner = '<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>'

const setLoading = (btn, isLoading, text) => {
  if (isLoading) {
    btn.dataset.originalText = btn.innerHTML
    btn.disabled = true
    btn.innerHTML = `${spinner}${text}`
    btn.classList.add('opacity-75', 'cursor-not-allowed')
  } else {
    btn.innerHTML = btn.dataset.originalText
    btn.disabled = false
    btn.classList.remove('opacity-75', 'cursor-not-allowed')
  }
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
                <p class="font-medium text-gray-700">${file}</p>
                <p class="text-xs text-gray-400">Ready to rename</p>
            </div>
            <button class="text-gray-400 hover:text-gray-600" aria-label="Remove ${file}">✕</button>
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
            <p class="font-medium text-gray-700">${file.oldName}</p>
            <p class="text-xs text-gray-400 mt-2">New Name</p>
            <p class="font-medium text-gray-700">${file.newName}</p>
            ${file.destination ? `<p class="text-xs text-gray-400 mt-2">Destination</p><p class="text-xs text-gray-500">${file.destination}</p>` : ''}
        </div>
    `).join('')
}

selectFolderBtn.addEventListener('click', async () => {
  const folderPath = await window.electron.openDialog()
  if (!folderPath) {
    renderFileList([])
    return
  }

  setLoading(selectFolderBtn, true, 'Loading...')
  try {
    selectedFolderPath = folderPath
    const files = await window.electron.readDirectory({ directoryPath: folderPath })
    renderFileList(files)
  } finally {
    setLoading(selectFolderBtn, false)
  }
})

renameFilesBtn.addEventListener('click', async () => {
  if (selectedFolderPath) {
    setLoading(renameFilesBtn, true, 'Applying...')
    try {
      previewPanel.innerHTML = '<div class="text-gray-400 italic">Renaming files...</div>'
      const options = {
        inputPath: selectedFolderPath,
        provider: providerSelect.value,
        model: modelInput.value,
        _case: caseSelect.value
      }
      const renamedFiles = await window.electron.processPath(options)
      renderPreview(renamedFiles)
    } finally {
      setLoading(renameFilesBtn, false)
    }
  }
})

renderFileList([])
renderPreview([])
