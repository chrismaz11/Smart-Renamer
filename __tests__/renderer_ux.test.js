/**
 * @jest-environment jsdom
 */
/* eslint-env jest */
const fs = require('fs')
const path = require('path')

describe('renderer.js UX improvements', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="file-count"></div>
      <div id="file-list"></div>
      <div id="preview-panel"></div>
      <button id="select-folder">Browse Files</button>
      <button id="rename-files">Apply Changes</button>
      <select id="provider"></select>
      <input id="model" />
      <select id="case"></select>
    `

    window.electron = {
      openDialog: jest.fn(),
      readDirectory: jest.fn(),
      processPath: jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve([]), 100)))
    }

    const rendererPath = path.join(__dirname, '../public/renderer.js')
    const rendererContent = fs.readFileSync(rendererPath, 'utf8')
    eval(rendererContent)
  })

  test('Rename button should show loading state during processing', async () => {
    const renameBtn = document.getElementById('rename-files')
    const selectBtn = document.getElementById('select-folder')

    // Setup preconditions (selected folder)
    window.electron.openDialog.mockResolvedValue('/tmp/test')
    window.electron.readDirectory.mockResolvedValue(['file1.txt'])

    // Trigger folder selection to set selectedFolderPath variable
    selectBtn.click()
    await new Promise(resolve => setTimeout(resolve, 0))

    // Click rename
    renameBtn.click()

    // Wait a tick for event listener to fire
    await new Promise(resolve => setTimeout(resolve, 0))

    // Expect loading state
    expect(renameBtn.disabled).toBe(true)
    // Check for spinner SVG or specific loading text
    // The spinner usually implies an SVG element
    const hasSvg = renameBtn.querySelector('svg') !== null
    expect(hasSvg).toBe(true)

    // Wait for process to finish
    await new Promise(resolve => setTimeout(resolve, 150))

    // Expect restored state
    expect(renameBtn.disabled).toBe(false)
    expect(renameBtn.textContent.trim()).toBe('Apply Changes')
  })
})
