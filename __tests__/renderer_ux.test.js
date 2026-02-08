/* eslint-env jest */
const fs = require('fs')
const path = require('path')
const vm = require('vm')

describe('Renderer UX', () => {
  let context
  let renameBtn
  let previewPanel

  beforeEach(() => {
    // Mock DOM elements
    renameBtn = {
      addEventListener: jest.fn(),
      classList: {
        add: jest.fn(),
        remove: jest.fn()
      },
      innerHTML: 'Original Text',
      dataset: {},
      disabled: false
    }

    previewPanel = {
      innerHTML: ''
    }

    const elements = {
      'rename-files': renameBtn,
      'preview-panel': previewPanel,
      'select-folder': { addEventListener: jest.fn() },
      'file-list': {},
      'file-count': {},
      provider: { value: 'ollama' },
      model: { value: 'llama2' },
      case: { value: 'camelCase' }
    }

    // Mock document
    const document = {
      getElementById: jest.fn((id) => elements[id])
    }

    // Mock window
    const window = {
      electron: {
        processPath: jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve([]), 50))),
        openDialog: jest.fn(),
        readDirectory: jest.fn()
      }
    }

    context = {
      document,
      window,
      console,
      setTimeout
    }

    vm.createContext(context)

    const rendererCode = fs.readFileSync(path.join(__dirname, '../public/renderer.js'), 'utf8')
    vm.runInContext(rendererCode, context)
  })

  test('button enters loading state on click', async () => {
    // Find the click handler for rename button
    const clickHandler = renameBtn.addEventListener.mock.calls.find(call => call[0] === 'click')[1]

    // We need to set selectedFolderPath. We can do this by simulating the folder selection flow.
    const selectFolderBtnMock = context.document.getElementById('select-folder')
    const selectFolderHandler = selectFolderBtnMock.addEventListener.mock.calls.find(call => call[0] === 'click')[1]

    context.window.electron.openDialog.mockResolvedValue('/tmp/test')
    context.window.electron.readDirectory.mockResolvedValue(['file1.txt'])

    await selectFolderHandler()

    // Now trigger rename click
    const promise = clickHandler()

    // Check loading state immediately (before promise resolves)
    expect(renameBtn.disabled).toBe(true)
    expect(renameBtn.classList.add).toHaveBeenCalledWith('opacity-75', 'cursor-not-allowed')
    expect(renameBtn.innerHTML).toContain('svg') // Check for spinner

    await promise

    // Check reset state
    expect(renameBtn.disabled).toBe(false)
    expect(renameBtn.classList.remove).toHaveBeenCalledWith('opacity-75', 'cursor-not-allowed')
    expect(renameBtn.innerHTML).toBe('Original Text')
  })
})
