/**
 * @jest-environment jsdom
 */

/* eslint-env jest */

const fs = require('fs')
const path = require('path')

describe('Renderer UI Logic', () => {
  let mockProcessPath
  let mockOpenDialog
  let renameBtn
  let previewPanel

  beforeEach(() => {
    // Set up our document body
    document.body.innerHTML = `
      <button id="select-folder">Select Folder</button>
      <button id="rename-files">Rename Files</button>
      <div id="file-list"></div>
      <span id="file-count"></span>
      <div id="preview-panel"></div>
      <select id="provider"><option value="ollama">ollama</option></select>
      <input id="model" value="llama3">
      <select id="case"><option value="camelCase">camelCase</option></select>
    `

    // Mock window.electron
    mockProcessPath = jest.fn()
    mockOpenDialog = jest.fn()
    window.electron = {
      openDialog: mockOpenDialog,
      readDirectory: jest.fn().mockResolvedValue([]),
      processPath: mockProcessPath
    }

    // Get references to elements we need to check
    renameBtn = document.getElementById('rename-files')
    previewPanel = document.getElementById('preview-panel')

    // Load the renderer script
    const rendererContent = fs.readFileSync(path.join(__dirname, '../public/renderer.js'), 'utf8')
    eval(rendererContent)
  })

  test('Rename button shows loading state during processing', async () => {
    // Setup: Simulate a folder selected so rename can proceed
    const selectFolderBtn = document.getElementById('select-folder')
    mockOpenDialog.mockResolvedValue('/tmp/test-folder')

    // Click select folder to set the internal state
    selectFolderBtn.click()

    // Wait for async operations (readDirectory)
    await new Promise(resolve => setTimeout(resolve, 0))

    // Make processPath slow so we can check loading state
    let resolveProcess
    mockProcessPath.mockImplementation(() => new Promise(resolve => {
      resolveProcess = resolve
    }))

    // Click rename
    renameBtn.click()

    // Assert Loading State (Expect failure here currently)
    expect(renameBtn.disabled).toBe(true)
    // We expect some spinner or text. Let's look for "Processing" or similar.
    // The implementation will add a spinner and text.
    // For now, let's just check disabled state as a start, or check innerHTML changed.
    expect(renameBtn.innerHTML).not.toBe('Rename Files')

    // Finish the process
    resolveProcess([{ oldName: 'a', newName: 'b' }])

    // Wait for the async handler to finish
    await new Promise(resolve => setTimeout(resolve, 0))

    // Assert Reset State
    expect(renameBtn.disabled).toBe(false)
    expect(mockProcessPath).toHaveBeenCalled()
  })
})
