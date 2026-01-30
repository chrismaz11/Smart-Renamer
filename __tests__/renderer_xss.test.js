/* eslint-env jest */
const fs = require('fs')
const path = require('path')
const vm = require('vm')

describe('Renderer XSS Vulnerability', () => {
  let context
  let elements

  beforeEach(() => {
    // Mock DOM elements
    elements = {}
    const getElementById = (id) => {
      if (!elements[id]) {
        elements[id] = {
          innerHTML: '',
          textContent: '',
          value: '',
          dataset: {},
          classList: {
             add: jest.fn(),
             remove: jest.fn()
          },
          addEventListener: jest.fn(),
        }
      }
      return elements[id]
    }

    // Mock window.electron
    const electron = {
      openDialog: jest.fn(),
      readDirectory: jest.fn(),
      processPath: jest.fn()
    }

    context = {
      document: { getElementById },
      window: { electron },
      console: { ...console }, // Pass console so we can see logs
      setTimeout: setTimeout // Pass timers
    }

    vm.createContext(context)

    // Read renderer.js
    const rendererCode = fs.readFileSync(path.join(__dirname, '../public/renderer.js'), 'utf8')
    vm.runInContext(rendererCode, context)
  })

  test('vulnerability: renders malicious filename as HTML', async () => {
    const maliciousFilename = '<img src=x onerror=alert(1)>'

    // Simulate openDialog returning a path
    context.window.electron.openDialog.mockResolvedValue('/tmp/test')

    // Simulate readDirectory returning the malicious file
    context.window.electron.readDirectory.mockResolvedValue([maliciousFilename])

    // Trigger the click handler on select-folder
    const selectFolderBtn = elements['select-folder']
    expect(selectFolderBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function))

    const clickHandler = selectFolderBtn.addEventListener.mock.calls.find(call => call[0] === 'click')[1]

    await clickHandler()

    // Check file-list innerHTML
    const fileList = elements['file-list']

    // The vulnerability is that the string is present exactly as is
    // Post-fix: it should NOT contain the raw malicious filename
    expect(fileList.innerHTML).not.toContain(maliciousFilename)

    // It should contain the escaped version
    expect(fileList.innerHTML).toContain('&lt;img src=x onerror=alert(1)&gt;')
  })
})
