/**
 * @jest-environment jsdom
 */

/* eslint-env jest */
/* eslint-disable no-eval */

const fs = require('fs')
const path = require('path')

describe('Renderer XSS Vulnerability', () => {
  let fileList
  let previewPanel
  let selectFolderBtn
  let renameFilesBtn
  let providerSelect
  let modelInput
  let caseSelect
  let fileCount

  beforeEach(() => {
    // Set up DOM
    document.body.innerHTML = `
      <div id="file-count">0 files</div>
      <div id="file-list"></div>
      <div id="preview-panel"></div>
      <button id="select-folder">Select Folder</button>
      <button id="rename-files">Rename Files</button>
      <select id="provider"><option value="ollama">ollama</option></select>
      <input id="model" value="llama2">
      <select id="case"><option value="camelCase">camelCase</option></select>
    `

    fileList = document.getElementById('file-list')
    previewPanel = document.getElementById('preview-panel')
    selectFolderBtn = document.getElementById('select-folder')
    renameFilesBtn = document.getElementById('rename-files')
    providerSelect = document.getElementById('provider')
    modelInput = document.getElementById('model')
    caseSelect = document.getElementById('case')
    fileCount = document.getElementById('file-count')

    // Mock window.electron
    window.electron = {
      openDialog: jest.fn(),
      readDirectory: jest.fn(),
      processPath: jest.fn()
    }

    // Load renderer.js
    const rendererCode = fs.readFileSync(path.join(__dirname, '../public/renderer.js'), 'utf8')
    eval(rendererCode)
  })

  test('should sanitize file names in file list to prevent XSS', async () => {
    const maliciousFile = '<img src=x onerror=alert(1)>'
    window.electron.openDialog.mockResolvedValue('/tmp')
    window.electron.readDirectory.mockResolvedValue([maliciousFile])

    // Trigger select folder
    selectFolderBtn.click()

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0))

    // Check if the malicious tag is rendered as HTML
    // If vulnerable, the <img tag will exist in the DOM
    const imgTag = fileList.querySelector('img')
    expect(imgTag).toBeNull()

    // Also check text content to ensure it's displayed as text
    expect(fileList.textContent).toContain('<img')
  })

  test('should sanitize file names in preview panel to prevent XSS', async () => {
    const maliciousFile = {
      oldName: '<img src=x onerror=alert(1)>',
      newName: '<b>bold</b>.txt',
      destination: '<script>alert(1)</script>'
    }

    // Setup state
    window.electron.openDialog.mockResolvedValue('/tmp')
    window.electron.readDirectory.mockResolvedValue(['somefile'])
    selectFolderBtn.click()
    await new Promise(resolve => setTimeout(resolve, 0))

    window.electron.processPath.mockResolvedValue([maliciousFile])

    // Trigger rename
    renameFilesBtn.click()

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0))

    // Check preview panel
    expect(previewPanel.querySelector('img')).toBeNull()
    expect(previewPanel.querySelector('b')).toBeNull()
    expect(previewPanel.querySelector('script')).toBeNull()

    // Check that the escaped text is visible
    expect(previewPanel.textContent).toContain('<img')
  })
})
