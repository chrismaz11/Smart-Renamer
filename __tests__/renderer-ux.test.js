/* eslint-env jest */
/* eslint-disable no-eval */
const fs = require('fs')
const path = require('path')

describe('Renderer UX', () => {
  let mockDocument
  let mockWindow
  let elements = {}
  let rendererCode

  beforeAll(() => {
    rendererCode = fs.readFileSync(path.join(__dirname, '../public/renderer.js'), 'utf8')
  })

  beforeEach(() => {
    elements = {
      'select-folder': { addEventListener: jest.fn(), innerHTML: '', dataset: {} },
      'rename-files': {
        addEventListener: jest.fn(),
        innerHTML: 'Apply Changes',
        dataset: {},
        classList: { add: jest.fn(), remove: jest.fn() }
      },
      'file-list': { innerHTML: '' },
      'file-count': { textContent: '' },
      'preview-panel': { innerHTML: '' },
      provider: { value: 'ollama' },
      model: { value: 'llama3' },
      case: { value: 'camelCase' }
    }

    mockDocument = {
      getElementById: jest.fn(id => {
        if (!elements[id]) {
          // Return a dummy element to prevent crashes for elements we don't care about
          return { addEventListener: jest.fn(), innerHTML: '', value: '' }
        }
        return elements[id]
      })
    }

    mockWindow = {
      electron: {
        openDialog: jest.fn(),
        readDirectory: jest.fn(),
        processPath: jest.fn()
      }
    }

    // Set globals for eval
    global.document = mockDocument
    global.window = mockWindow
  })

  afterEach(() => {
    delete global.document
    delete global.window
  })

  test('Rename button shows loading state during processing', async () => {
    // Execute renderer code
    // We execute it inside a function to avoid polluting the top-level scope with const declarations
    // if we were to run multiple tests (though here we just run one mostly)
    // However, re-evaluating consts might throw if we run multiple tests in same context.
    // Jest runs each test file in isolation, but beforeEach runs in same context?
    // No, describe block runs once?
    // Actually, eval-ing 'const x' multiple times in same scope throws.
    // So we should probably run this test only once or handle scoping.
    // Ideally we use vm.runInNewContext but that requires setting up console etc.
    // For simplicity, we'll just run eval here.

    // To avoid "Identifier 'selectFolderBtn' has already been declared" error if we had multiple tests:
    // We can wrap the code in an IIFE or block?
    // But the event listeners need to persist.
    // Since we only have one test for now, it's fine.
    // If we add more, we might need to wrap in { ... } or use vm.

    eval(rendererCode)

    const renameBtn = elements['rename-files']
    // Find the click handler
    // Note: The code calls addEventListener immediately.
    const clickHandler = renameBtn.addEventListener.mock.calls.find(call => call[0] === 'click')[1]
    expect(clickHandler).toBeDefined()

    // 1. Simulate folder selection to set selectedFolderPath
    const selectFolderBtn = elements['select-folder']
    const selectHandler = selectFolderBtn.addEventListener.mock.calls.find(call => call[0] === 'click')[1]

    mockWindow.electron.openDialog.mockResolvedValue('/tmp/test')
    mockWindow.electron.readDirectory.mockResolvedValue(['file1.txt'])

    await selectHandler()

    // 2. Setup processPath to delay
    let resolveProcess
    const processPromise = new Promise(resolve => { resolveProcess = resolve })
    mockWindow.electron.processPath.mockReturnValue(processPromise)

    // 3. Trigger rename click
    const clickPromise = clickHandler()

    // 4. Verify loading state ON
    expect(renameBtn.disabled).toBe(true)
    expect(renameBtn.classList.add).toHaveBeenCalledWith('opacity-75', 'cursor-not-allowed')
    expect(renameBtn.innerHTML).toContain('animate-spin')
    expect(renameBtn.innerHTML).toContain('Renaming...')

    // 5. Finish processing
    resolveProcess([{ oldName: 'a', newName: 'b' }])
    await clickPromise

    // 6. Verify loading state OFF
    expect(renameBtn.disabled).toBe(false)
    expect(renameBtn.classList.remove).toHaveBeenCalledWith('opacity-75', 'cursor-not-allowed')
    expect(renameBtn.innerHTML).toBe('Apply Changes')
  })
})
