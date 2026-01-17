/**
 * @jest-environment jsdom
 */

/* eslint-env jest */

// Mock window.electron
window.electron = {
  openDialog: jest.fn(),
  readDirectory: jest.fn(),
  processPath: jest.fn()
}

// Set up DOM
document.body.innerHTML = `
  <div id="preview-panel"></div>
  <div id="file-list"></div>
  <div id="file-count"></div>
  <button id="select-folder">Select Folder</button>
  <button id="rename-files">Rename Files</button>
  <select id="provider"><option value="ollama">Ollama</option></select>
  <input id="model" value="llama2">
  <select id="case"><option value="camelCase">camelCase</option></select>
`

const fs = require('fs')
const path = require('path')
const rendererCode = fs.readFileSync(path.resolve(__dirname, '../public/renderer.js'), 'utf8')

describe('renderer.js UX', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('rename button shows loading state during processing', async () => {
    try {
      // eslint-disable-next-line no-eval
      eval(rendererCode)
    } catch (e) {
      // Ignore "Identifier has already been declared" if it happens
      if (!e.message.includes('has already been declared')) {
        throw e
      }
    }

    const renameBtn = document.getElementById('rename-files')
    const selectBtn = document.getElementById('select-folder')

    // Setup initial state
    window.electron.openDialog.mockResolvedValue('/tmp/test')
    window.electron.readDirectory.mockResolvedValue(['file1.txt'])

    // Select folder to enable rename logic
    selectBtn.click()
    await new Promise(resolve => setTimeout(resolve, 0))

    // Mock processPath to hang until we resolve it
    let resolveProcess
    const processPromise = new Promise(resolve => { resolveProcess = resolve })
    window.electron.processPath.mockReturnValue(processPromise)

    // Click rename
    renameBtn.click()

    // Check loading state
    expect(renameBtn.disabled).toBe(true)
    expect(renameBtn.innerHTML).toContain('Renaming...')
    expect(renameBtn.classList.contains('opacity-75')).toBe(true)
    expect(renameBtn.classList.contains('cursor-not-allowed')).toBe(true)

    // Resolve the process
    resolveProcess([{ oldName: 'file1.txt', newName: 'file1_renamed.txt' }])
    await new Promise(resolve => setTimeout(resolve, 0)) // Wait for await processPath

    // Check restored state
    expect(renameBtn.disabled).toBe(false)
    expect(renameBtn.innerHTML).not.toContain('Renaming...')
    expect(renameBtn.textContent).toContain('Rename Files')
    expect(renameBtn.classList.contains('opacity-75')).toBe(false)
  })
})
