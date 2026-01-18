/**
 * @jest-environment jsdom
 */
/* eslint-env jest */
const fs = require('fs')
const path = require('path')

describe('Renderer XSS Vulnerability', () => {
  let rendererScript

  beforeAll(() => {
    rendererScript = fs.readFileSync(path.resolve(__dirname, '../public/renderer.js'), 'utf8')
  })

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <div id="file-count"></div>
      <div id="file-list"></div>
      <div id="preview-panel"></div>
      <button id="select-folder"></button>
      <button id="rename-files"></button>
      <select id="provider"><option value="ollama">ollama</option></select>
      <input id="model" value="llama3">
      <select id="case"><option value="camelCase">camelCase</option></select>
    `

    // Mock window.electron
    window.electron = {
      openDialog: jest.fn(),
      readDirectory: jest.fn(),
      processPath: jest.fn()
    }
  })

  it('should escape HTML in file names to prevent XSS', async () => {
    // Wrap script in IIFE to avoid global scope pollution (redeclaration errors) if run multiple times
    // and to simulate local scope.
    const protectedScript = `(function() { ${rendererScript} })();`

    // Execute the script
    // eslint-disable-next-line no-eval
    eval(protectedScript)

    const selectFolderBtn = document.getElementById('select-folder')
    const fileList = document.getElementById('file-list')

    // Setup mock
    const maliciousFile = '<img src=x onerror=alert(1)>'
    window.electron.openDialog.mockResolvedValue('/tmp')
    window.electron.readDirectory.mockResolvedValue([maliciousFile])

    // Trigger click to load files
    await selectFolderBtn.click()

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0))

    const html = fileList.innerHTML

    // If vulnerable, the HTML will contain the raw image tag.
    // If secure, it should be escaped.

    // Check that the malicious tag was NOT created as a DOM element
    const imgTag = fileList.querySelector('img')
    expect(imgTag).toBeNull()

    // Check that the filename is displayed as text (escaped)
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;')
  })

  it('should escape HTML in preview panel to prevent XSS', async () => {
    const protectedScript = `(function() { ${rendererScript} })();`
    // eslint-disable-next-line no-eval
    eval(protectedScript)

    const renameFilesBtn = document.getElementById('rename-files')
    const previewPanel = document.getElementById('preview-panel')
    const selectFolderBtn = document.getElementById('select-folder')

    // First select folder to set selectedFolderPath
    window.electron.openDialog.mockResolvedValue('/tmp')
    window.electron.readDirectory.mockResolvedValue(['safe.txt'])
    await selectFolderBtn.click()
    await new Promise(resolve => setTimeout(resolve, 0))

    // Now trigger rename
    const maliciousNewName = '<b>bold</b>.txt'
    window.electron.processPath.mockResolvedValue([
      { oldName: 'safe.txt', newName: maliciousNewName }
    ])

    await renameFilesBtn.click()
    await new Promise(resolve => setTimeout(resolve, 0))

    const html = previewPanel.innerHTML
    expect(html).not.toContain('<b>bold</b>.txt')
    expect(html).toContain('&lt;b&gt;bold&lt;/b&gt;.txt')
  })
})
