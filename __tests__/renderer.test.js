/* eslint-env jest */
const fs = require('fs')
const path = require('path')
const vm = require('vm')

describe('renderer.js', () => {
  let sandbox
  let elements

  beforeEach(() => {
    // Mock DOM elements
    elements = {
      'select-folder': { addEventListener: jest.fn(), dataset: {} },
      'rename-files': {
        addEventListener: jest.fn(),
        dataset: {},
        classList: { add: jest.fn(), remove: jest.fn() },
        innerHTML: 'Apply Changes',
        disabled: false
      },
      'file-list': { innerHTML: '' },
      'file-count': { textContent: '' },
      'preview-panel': { innerHTML: '' },
      provider: { value: 'ollama' },
      model: { value: 'llama3' },
      case: { value: 'camelCase' }
    }

    // Sandbox environment
    sandbox = {
      document: {
        getElementById: jest.fn((id) => {
          return elements[id] || { addEventListener: jest.fn(), dataset: {} }
        })
      },
      window: {
        electron: {
          openDialog: jest.fn(),
          readDirectory: jest.fn(),
          processPath: jest.fn()
        }
      },
      console
    }

    vm.createContext(sandbox)
  })

  test('loading state is managed correctly during rename', async () => {
    const code = fs.readFileSync(path.join(__dirname, '../public/renderer.js'), 'utf8')
    vm.runInContext(code, sandbox)

    const selectFolderBtn = elements['select-folder']
    const renameBtn = elements['rename-files']

    // Simulate folder selection
    sandbox.window.electron.openDialog.mockResolvedValue('/tmp/test')
    sandbox.window.electron.readDirectory.mockResolvedValue(['file1.txt'])

    const selectHandler = selectFolderBtn.addEventListener.mock.calls.find(call => call[0] === 'click')[1]
    await selectHandler()

    // Setup rename
    let resolveProcess
    const processPromise = new Promise(resolve => { resolveProcess = resolve })
    sandbox.window.electron.processPath.mockImplementation(() => processPromise)

    const renameHandler = renameBtn.addEventListener.mock.calls.find(call => call[0] === 'click')[1]
    const renameActionPromise = renameHandler() // Triggers the async function

    // Allow the event loop to turn so the first part of the async function runs
    await new Promise(resolve => setTimeout(resolve, 0))

    // ASSERT LOADING STATE
    expect(renameBtn.disabled).toBe(true)
    expect(renameBtn.classList.add).toHaveBeenCalledWith('cursor-not-allowed', 'opacity-75')
    expect(renameBtn.innerHTML).toContain('<svg') // Expecting spinner

    // Resolve
    resolveProcess([{ oldName: 'a', newName: 'b' }])
    await renameActionPromise

    // ASSERT RESTORED STATE
    expect(renameBtn.disabled).toBe(false)
    expect(renameBtn.classList.remove).toHaveBeenCalledWith('cursor-not-allowed', 'opacity-75')
    expect(renameBtn.innerHTML).toBe('Apply Changes') // Should be restored (using dataset or stored value)
  })
})
