/** @jest-environment jsdom */
/* eslint-env jest */
/* eslint-disable no-eval */

const fs = require('fs')
const path = require('path')

describe('Renderer Logic', () => {
  let mockElectron
  let rendererCode

  beforeAll(() => {
    const rendererPath = path.join(__dirname, '../public/renderer.js')
    rendererCode = fs.readFileSync(rendererPath, 'utf8')
  })

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <button id="select-folder">Select Folder</button>
      <button id="rename-files" data-original-text="Apply Changes">Apply Changes</button>
      <div id="file-list"></div>
      <span id="file-count">0 files</span>
      <div id="preview-panel"></div>
      <select id="provider"><option value="ollama">ollama</option></select>
      <input id="model" value="llama2">
      <select id="case"><option value="camelCase">camelCase</option></select>
    `

    // Mock window.electron
    mockElectron = {
      openDialog: jest.fn(),
      readDirectory: jest.fn(),
      processPath: jest.fn()
    }
    window.electron = mockElectron

    // Execute renderer.js in a safe scope
    // We wrap in an IIFE so 'const' declarations don't conflict if we were to run multiple tests (though here we might just have one)
    // and to capture the closure state for this specific test run.
    eval(`(function(){ ${rendererCode} })()`)
  })

  test('rename button shows loading state during processing', async () => {
    const renameBtn = document.getElementById('rename-files')
    const selectFolderBtn = document.getElementById('select-folder')
    const previewPanel = document.getElementById('preview-panel')

    // 1. Select a folder first to enable renaming
    mockElectron.openDialog.mockResolvedValue('/test/path')
    mockElectron.readDirectory.mockResolvedValue(['test.txt'])

    // Trigger folder selection
    selectFolderBtn.click()

    // Wait for the async operation in the click handler to complete
    // Since the handler is async, we can't await the click() result directly as it returns void.
    // We wait for the promise chain to settle.
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(mockElectron.openDialog).toHaveBeenCalled()
    expect(mockElectron.readDirectory).toHaveBeenCalledWith({ directoryPath: '/test/path' })

    // 2. Setup processPath with a controlled promise
    let resolveProcess
    const processPromise = new Promise(resolve => { resolveProcess = resolve })
    mockElectron.processPath.mockReturnValue(processPromise)

    // 3. Click Rename
    renameBtn.click()

    // 4. Verify Loading State
    // The loading state should be applied synchronously (or microtask) before the await inside the handler
    await new Promise(resolve => setTimeout(resolve, 0)) // allow event loop to turn

    // Note: Since we haven't implemented the feature yet, these expects will FAIL.
    // This confirms we are doing TDD (or close to it).
    // But for the purpose of this task, I will write the test to EXPECT the feature.
    // If I run this now, it should fail.

    // I will assert that the button is disabled and has spinner
    expect(renameBtn.disabled).toBe(true)
    expect(renameBtn.innerHTML).toContain('animate-spin')
    expect(previewPanel.innerHTML).toContain('Renaming files...')

    // 5. Resolve the process
    resolveProcess([{ oldName: 'test.txt', newName: 'new.txt' }])

    // 6. Wait for completion
    await new Promise(resolve => setTimeout(resolve, 0)) // allow await processPath to resume

    // 7. Verify Reset State
    expect(renameBtn.disabled).toBe(false)
    expect(renameBtn.innerHTML).not.toContain('animate-spin')
    // We check if it contains original text.
    // In our mock HTML we put 'Apply Changes'.
    expect(renameBtn.textContent).toContain('Apply Changes')
  })
})
