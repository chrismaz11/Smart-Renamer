/**
 * @jest-environment jsdom
 */

/* eslint-env jest */
/* eslint-disable no-eval */

const fs = require('fs')
const path = require('path')

describe('Renderer Security', () => {
  let rendererScript

  beforeAll(() => {
    rendererScript = fs.readFileSync(path.join(__dirname, '../public/renderer.js'), 'utf8')
  })

  test('renderFileList escapes malicious filenames to prevent XSS', async () => {
    // Setup DOM
    document.body.innerHTML = `
      <button id="select-folder"></button>
      <button id="rename-files"></button>
      <div id="file-list"></div>
      <div id="file-count"></div>
      <div id="preview-panel"></div>
      <select id="provider"></select>
      <input id="model" />
      <select id="case"></select>
    `

    // Mock window.electron
    window.electron = {
      openDialog: jest.fn(),
      readDirectory: jest.fn(),
      processPath: jest.fn()
    }

    // Execute renderer script
    // We execute it inside the test to avoid variable redeclaration issues if we had multiple tests
    eval(rendererScript)

    const maliciousFile = '<img src=x onerror=alert(1)>'

    // Mock electron.openDialog to return a path
    window.electron.openDialog.mockResolvedValue('/tmp')

    // Mock electron.readDirectory to return malicious file
    window.electron.readDirectory.mockResolvedValue([maliciousFile])

    const selectFolderBtn = document.getElementById('select-folder')
    selectFolderBtn.click()

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 100))

    const fileList = document.getElementById('file-list')

    // Check that the output is escaped
    // If vulnerable, it would be: ...<p class="font-medium text-gray-700"><img src=x onerror=alert(1)></p>...
    // If secure, it should be: ...<p class="font-medium text-gray-700">&lt;img src=x onerror=alert(1)&gt;</p>...

    // We check that no img tag was actually created in the DOM
    expect(fileList.querySelectorAll('img').length).toBe(0)

    // And it SHOULD contain the escaped version in the text content
    expect(fileList.textContent).toContain(maliciousFile)
    // Note: textContent unescapes entities, so it should look like the original string
  })
})
