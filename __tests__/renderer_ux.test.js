/**
 * @jest-environment jsdom
 */
/* eslint-env jest */

const fs = require('fs')
const path = require('path')

describe('Renderer UX', () => {
  let rendererScript

  beforeAll(() => {
    rendererScript = fs.readFileSync(path.resolve(__dirname, '../public/renderer.js'), 'utf8')
  })

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <button id="select-folder">Select Folder</button>
      <button id="rename-files">Rename Files</button>
      <div id="file-list"></div>
      <span id="file-count">0 files</span>
      <div id="preview-panel"></div>
      <select id="provider"><option value="ollama">ollama</option></select>
      <input id="model" value="llama3" />
      <select id="case"><option value="camelCase">camelCase</option></select>
    `

    // Mock Electron
    window.electron = {
      openDialog: jest.fn(),
      processPath: jest.fn(),
      readDirectory: jest.fn()
    }

    // We mock console.error to keep test output clean
    jest.spyOn(console, 'error').mockImplementation(() => {})

    // Execute script
    // Wrap in IIFE to avoid variable redeclaration errors if we were to run this multiple times
    // and to capture top-level variables.
    try {
      // eslint-disable-next-line no-eval
      eval(`(() => { ${rendererScript} })()`)
    } catch (e) {
      console.error('Error executing renderer script:', e)
    }
  })

  test('Rename button shows loading state during processing', async () => {
    const renameBtn = document.getElementById('rename-files')
    const selectFolderBtn = document.getElementById('select-folder')

    // Simulate folder selection first so rename works
    window.electron.openDialog.mockResolvedValue('/tmp/test')
    window.electron.readDirectory.mockResolvedValue(['file1.txt'])

    // Trigger folder selection
    selectFolderBtn.click()
    // Wait for the async openDialog and readDirectory to resolve
    await new Promise(resolve => setTimeout(resolve, 0))

    // Verify folder is selected (indirectly via file list or just assume it worked if no error)
    // Now setup processPath to hang so we can check loading state
    let resolveProcess
    const processPromise = new Promise((resolve) => { resolveProcess = resolve })
    window.electron.processPath.mockReturnValue(processPromise)

    // Click rename
    renameBtn.click()

    // Check loading state
    expect(renameBtn.disabled).toBe(true)
    // We expect the spinner SVG or text change.
    expect(renameBtn.innerHTML).toContain('Renaming...')
    // We also expect a spinner SVG
    expect(renameBtn.querySelector('svg')).not.toBeNull()

    // Resolve the process
    resolveProcess([{ oldName: 'file1.txt', newName: 'file1_renamed.txt' }])
    await new Promise(resolve => setTimeout(resolve, 0)) // Wait for await processPath

    // Check reset state
    expect(renameBtn.disabled).toBe(false)
    expect(renameBtn.innerHTML).not.toContain('Renaming...')
    // Should contain original text
    expect(renameBtn.innerHTML).toContain('Rename Files')
  })
})
