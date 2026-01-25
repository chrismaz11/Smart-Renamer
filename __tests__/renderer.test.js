/**
 * @jest-environment jsdom
 */
/* eslint-env jest */
/* eslint-disable no-eval */

const fs = require('fs')
const path = require('path')

const rendererCode = fs.readFileSync(path.join(__dirname, '../public/renderer.js'), 'utf8')

describe('Renderer XSS Vulnerability', () => {
  let mockOpenDialog
  let mockReadDirectory
  let mockProcessPath

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="file-list"></div>
      <div id="file-count"></div>
      <div id="preview-panel"></div>
      <button id="select-folder"></button>
      <button id="rename-files"></button>
      <select id="provider"><option value="ollama">Ollama</option></select>
      <input id="model" value="llama2">
      <select id="case"><option value="kebabCase">kebab-case</option></select>
    `

    mockOpenDialog = jest.fn()
    mockReadDirectory = jest.fn()
    mockProcessPath = jest.fn()

    window.electron = {
      openDialog: mockOpenDialog,
      readDirectory: mockReadDirectory,
      processPath: mockProcessPath
    }

    // Evaluate the renderer code
    // Wrapping in a function to avoid global scope pollution if any, though JSDOM + Jest usually isolates well enough.
    // Also ensuring it runs in the context where document is available.
    eval(rendererCode)
  })

  test('should NOT execute malicious HTML in file list (XSS)', async () => {
    const maliciousFile = '<img src=x onerror=alert(1)>'
    mockOpenDialog.mockResolvedValue('/tmp/test')
    mockReadDirectory.mockResolvedValue([maliciousFile])

    const selectFolderBtn = document.getElementById('select-folder')
    selectFolderBtn.click()

    // Wait for async operations
    // The click handler awaits openDialog, then awaits readDirectory
    await new Promise(resolve => setTimeout(resolve, 0))
    await new Promise(resolve => setTimeout(resolve, 0))
    await new Promise(resolve => setTimeout(resolve, 0))

    const fileList = document.getElementById('file-list')

    // If vulnerable, innerHTML will contain the img tag
    // We want to ensure it is ESCAPED.
    // So innerHTML should contain &lt;img...
    // Or simpler: checking querySelector
    const imgTag = fileList.querySelector('img')
    expect(imgTag).toBeNull()

    // Also check that the text content IS the malicious string (so the user sees the filename)
    expect(fileList.textContent).toContain(maliciousFile)
  })

  test('should NOT execute malicious HTML in preview panel (XSS)', async () => {
    // Setup state for renameFilesBtn
    mockProcessPath.mockResolvedValue([
      { oldName: '<img src=x onerror=alert(1)>', newName: 'safe.png', destination: '' }
    ])

    // We need to trigger the state where selectedFolderPath is set.
    // Accessing internal variable 'selectedFolderPath' is hard via eval.
    // But we can trigger the flow.

    mockOpenDialog.mockResolvedValue('/tmp/test')
    mockReadDirectory.mockResolvedValue(['somefile'])
    document.getElementById('select-folder').click()
    await new Promise(resolve => setTimeout(resolve, 0))
    await new Promise(resolve => setTimeout(resolve, 0))

    // Now click rename
    const renameBtn = document.getElementById('rename-files')
    renameBtn.click()

    await new Promise(resolve => setTimeout(resolve, 0))
    await new Promise(resolve => setTimeout(resolve, 0))

    const previewPanel = document.getElementById('preview-panel')
    const imgTag = previewPanel.querySelector('img')
    expect(imgTag).toBeNull()
    expect(previewPanel.textContent).toContain('<img src=x onerror=alert(1)>')
  })
})
