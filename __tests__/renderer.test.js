/**
 * @jest-environment jsdom
 */
/* eslint-env jest */
const fs = require('fs')
const path = require('path')

const rendererScript = fs.readFileSync(path.resolve(__dirname, '../public/renderer.js'), 'utf8')

describe('Renderer', () => {
  let openDialogMock
  let readDirectoryMock
  let processPathMock

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <button id="select-folder">Browse Files</button>
      <button id="rename-files">Apply Changes</button>
      <div id="file-list"></div>
      <span id="file-count">0 files</span>
      <div id="preview-panel"></div>
      <select id="provider"><option value="ollama">ollama</option></select>
      <input id="model" value="llama3">
      <select id="case"><option value="camelCase">camelCase</option></select>
    `

    // Mock Electron API
    openDialogMock = jest.fn()
    readDirectoryMock = jest.fn()
    processPathMock = jest.fn()

    window.electron = {
      openDialog: openDialogMock,
      readDirectory: readDirectoryMock,
      processPath: processPathMock
    }

    jest.resetModules()
    // eslint-disable-next-line no-eval
    eval(rendererScript)
  })

  test('rename button shows loading state during processing', async () => {
    const renameBtn = document.getElementById('rename-files')

    // Simulate folder selected
    const selectFolderBtn = document.getElementById('select-folder')
    openDialogMock.mockResolvedValue('/tmp/test')
    readDirectoryMock.mockResolvedValue(['file1.txt'])

    selectFolderBtn.click()
    // Wait for async operations in selectFolder handler
    await new Promise(resolve => setTimeout(resolve, 0))

    // Mock processPath to be slow so we can check loading state
    const promise = new Promise(resolve => {
      processPathMock.mockImplementation(async () => {
        // Check loading state while running
        try {
          expect(renameBtn.disabled).toBe(true)
          expect(renameBtn.innerHTML).toMatch(/Renaming/)
          expect(renameBtn.innerHTML).toContain('svg') // Expecting a spinner
        } catch (e) {
          resolve(e) // Fail the promise with error
          return []
        }
        resolve(null)
        return []
      })
    })

    renameBtn.click()

    const error = await promise
    if (error) throw error

    // Wait for finish
    await new Promise(resolve => setTimeout(resolve, 0))

    // After finish
    expect(renameBtn.disabled).toBe(false)
    expect(renameBtn.textContent).toContain('Apply Changes')
  })
})
