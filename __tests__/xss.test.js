/**
 * @jest-environment jsdom
 */
/* eslint-env jest */
/* eslint-disable no-eval */

const fs = require('fs')
const path = require('path')

const wait = () => new Promise(resolve => setTimeout(resolve, 0))

describe('Renderer XSS Vulnerability', () => {
  let rendererScript

  beforeAll(() => {
    rendererScript = fs.readFileSync(path.resolve(__dirname, '../public/renderer.js'), 'utf8')
  })

  beforeEach(() => {
    document.body.innerHTML = `
            <button id="select-folder"></button>
            <button id="rename-files"></button>
            <div id="file-list"></div>
            <div id="file-count"></div>
            <div id="preview-panel"></div>
            <select id="provider"><option value="ollama">Ollama</option></select>
            <input id="model" value="llama2">
            <select id="case"><option value="camelCase">camelCase</option></select>
        `

    window.electron = {
      openDialog: jest.fn(),
      readDirectory: jest.fn(),
      processPath: jest.fn()
    }
  })

  test('should prevent XSS in file list', async () => {
    eval(rendererScript)

    const maliciousFile = '<img src=x onerror=alert(1)>'

    window.electron.openDialog.mockResolvedValue('/tmp')
    window.electron.readDirectory.mockResolvedValue([maliciousFile])

    const selectFolderBtn = document.getElementById('select-folder')
    selectFolderBtn.click()
    await wait()

    const fileList = document.getElementById('file-list')
    const img = fileList.querySelector('img')

    // Should NOT find an img tag
    expect(img).toBeNull()
    // Should find escaped text content
    expect(fileList.textContent).toContain(maliciousFile) // textContent decodes entities, so we see original string
    expect(fileList.innerHTML).toContain('&lt;img')
  })

  test('should prevent XSS in preview panel', async () => {
    eval(rendererScript)

    const maliciousOldName = '<img src=x onerror=alert("old")>'
    const maliciousNewName = '<img src=x onerror=alert("new")>'

    const selectFolderBtn = document.getElementById('select-folder')
    window.electron.openDialog.mockResolvedValue('/tmp')
    window.electron.readDirectory.mockResolvedValue(['some-file'])
    selectFolderBtn.click()
    await wait()

    window.electron.processPath.mockResolvedValue([
      { oldName: maliciousOldName, newName: maliciousNewName }
    ])

    const renameBtn = document.getElementById('rename-files')
    renameBtn.click()
    await wait()

    const previewPanel = document.getElementById('preview-panel')
    const imgs = previewPanel.querySelectorAll('img')

    // Should NOT find img tags
    expect(imgs.length).toBe(0)
    expect(previewPanel.innerHTML).toContain('&lt;img')
  })
})
