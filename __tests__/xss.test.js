/**
 * @jest-environment jsdom
 */

/* eslint-env jest */

const fs = require('fs')
const path = require('path')

describe('Security: XSS Prevention', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <div id="file-list"></div>
      <div id="file-count"></div>
      <div id="preview-panel"></div>
      <button id="select-folder"></button>
      <button id="rename-files"></button>
      <select id="provider"><option>ollama</option></select>
      <input id="model" />
      <select id="case"><option>camelCase</option></select>
    `

    // Mock window.electron
    window.electron = {
      openDialog: jest.fn(),
      readDirectory: jest.fn(),
      processPath: jest.fn()
    }
  })

  test('renderFileList escapes malicious filenames', async () => {
    // Read the renderer script
    const rendererScript = fs.readFileSync(path.resolve(__dirname, '../public/renderer.js'), 'utf8')

    // Replace const/let with var to allow re-evaluation without errors in the same context if needed,
    // although for a single test run it might be fine.
    // However, to be safe and ensure variables leak to the scope where we can interact if needed (though we rely on DOM events here)
    // AND to avoid "Identifier 'x' has already been declared" if jest runs this in the same context (unlikely with resetModules but still).
    // Actually, the main issue is that `renderer.js` executes immediately.

    // We execute it.
    // Note: We need to handle the async nature of the event listeners.

    // We just use eval.
    // eslint-disable-next-line no-eval
    eval(rendererScript)

    // Setup the attack vector
    const maliciousFilename = '<img src=x onerror=alert(1)>'
    window.electron.openDialog.mockResolvedValue('/safe/path')
    window.electron.readDirectory.mockResolvedValue([maliciousFilename])

    // Trigger the flow
    const btn = document.getElementById('select-folder')
    btn.click()

    // Wait for promises to resolve (microtasks)
    await new Promise(resolve => setTimeout(resolve, 100))

    const fileList = document.getElementById('file-list')

    // If vulnerable, it will contain the HTML tag
    // If secure, it should be escaped
    // Verify that the malicious script is NOT executed and NOT rendered as an HTML element
    const images = fileList.querySelectorAll('img')
    expect(images.length).toBe(0)

    // Verify that the filename is rendered as text
    // The p tag should contain the text representation of the filename
    const paragraphs = fileList.querySelectorAll('p')
    let foundFilenameAsText = false
    paragraphs.forEach(p => {
      if (p.textContent.includes('<img src=x onerror=alert(1)>')) {
        foundFilenameAsText = true
      }
    })
    expect(foundFilenameAsText).toBe(true)
  })
})
