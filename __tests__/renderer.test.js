/**
 * @jest-environment jsdom
 */

/* eslint-env jest */
/* eslint-disable no-eval */

const fs = require('fs')
const path = require('path')

describe('Renderer', () => {
  let processPathMock
  let renameFilesBtn

  beforeEach(() => {
    // Set up DOM
    document.body.innerHTML = `
      <button id="select-folder">Select Folder</button>
      <button id="rename-files">Rename Files</button>
      <div id="file-list"></div>
      <span id="file-count"></span>
      <div id="preview-panel"></div>
      <select id="provider"><option value="ollama">ollama</option></select>
      <input id="model" value="llama2">
      <select id="case"><option value="camelCase">camelCase</option></select>
    `

    // Mock window.electron
    processPathMock = jest.fn()
    window.electron = {
      openDialog: jest.fn(),
      readDirectory: jest.fn().mockResolvedValue([]),
      processPath: processPathMock
    }

    // Get references to elements
    renameFilesBtn = document.getElementById('rename-files')
  })

  test('Apply Changes button shows loading spinner during processing', async () => {
    // Load and evaluate renderer.js
    const rendererCode = fs.readFileSync(path.resolve(__dirname, '../public/renderer.js'), 'utf8')
    eval(rendererCode)

    // Set selectedFolderPath by triggering folder selection
    window.electron.openDialog.mockResolvedValue('/tmp/test-folder')
    window.electron.readDirectory.mockResolvedValue(['file1.txt'])

    const selectFolderBtn = document.getElementById('select-folder')
    await selectFolderBtn.click()

    // Mock processPath to delay so we can check loading state
    processPathMock.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => {
        resolve([{ oldName: 'file1.txt', newName: 'file1_renamed.txt' }])
      }, 100)
    }))

    // Trigger click
    renameFilesBtn.click()

    // Check loading state immediately
    // Note: The event listener is async, so it returns a promise, but we can't await it directly via click()
    // However, the synchronous part of the listener (setting loading state) should happen before the await.
    // Wait, the listener is `async () => { ... }`.
    // When click happens, the function starts. It hits `setLoading` (synchronous).
    // Then it hits `await window.electron.processPath`.
    // So checking immediately after click() should show the loading state.

    // We need to wait a tick for the promise to start? No, click() is synchronous, but the async handler returns a promise that is ignored by the event system.
    // But the code until the first await runs synchronously.

    expect(renameFilesBtn.disabled).toBe(true)
    expect(renameFilesBtn.innerHTML).toContain('svg') // Spinner
    expect(renameFilesBtn.innerHTML).toContain('Renaming...')

    // Wait for the mock delay to finish
    // We use setTimeout to wait for the internal promise to resolve
    await new Promise(resolve => setTimeout(resolve, 150))

    // Check restored state
    expect(renameFilesBtn.disabled).toBe(false)
    expect(renameFilesBtn.innerHTML).not.toContain('svg')
    expect(renameFilesBtn.innerHTML).toContain('Rename Files')
  })
})
