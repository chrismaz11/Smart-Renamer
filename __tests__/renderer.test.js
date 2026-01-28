/* eslint-env jest */
const fs = require('fs')
const path = require('path')
const vm = require('vm')

describe('Renderer UX', () => {
  let mockDocument
  let mockWindow
  let elements

  beforeEach(() => {
    elements = {
      'select-folder': createMockElement('button'),
      'rename-files': createMockElement('button', 'Apply Changes'),
      'file-list': createMockElement('div'),
      'file-count': createMockElement('span'),
      'preview-panel': createMockElement('div'),
      provider: createMockElement('select'),
      model: createMockElement('input'),
      case: createMockElement('select')
    }

    mockDocument = {
      getElementById: jest.fn((id) => elements[id])
    }

    mockWindow = {
      electron: {
        openDialog: jest.fn(),
        readDirectory: jest.fn().mockResolvedValue([]),
        processPath: jest.fn().mockResolvedValue([])
      }
    }
  })

  function createMockElement (tag, initialHtml = '') {
    return {
      tagName: tag.toUpperCase(),
      innerHTML: initialHtml,
      dataset: {},
      disabled: false,
      classList: {
        add: jest.fn(),
        remove: jest.fn()
      },
      addEventListener: jest.fn(),
      value: ''
    }
  }

  test('Apply Changes button should show loading state during processing', async () => {
    const rendererCode = fs.readFileSync(path.join(__dirname, '../public/renderer.js'), 'utf8')

    const sandbox = {
      document: mockDocument,
      window: mockWindow,
      console
    }
    vm.createContext(sandbox)
    vm.runInContext(rendererCode, sandbox)

    const selectFolderBtn = elements['select-folder']
    const renameFilesBtn = elements['rename-files']

    // Get the click handlers
    const selectFolderHandler = selectFolderBtn.addEventListener.mock.calls.find(call => call[0] === 'click')[1]
    const renameFilesHandler = renameFilesBtn.addEventListener.mock.calls.find(call => call[0] === 'click')[1]

    // Simulate folder selection
    mockWindow.electron.openDialog.mockResolvedValue('/tmp/test')
    await selectFolderHandler()

    // Simulate rename click with delayed response
    let resolveProcess
    const processPromise = new Promise(resolve => { resolveProcess = resolve })
    mockWindow.electron.processPath.mockReturnValue(processPromise)

    const renamePromise = renameFilesHandler()

    // VERIFY LOADING STATE
    // These assertions should pass AFTER we implement the fix.
    // For now, if we run this test, it should fail (or pass if we didn't assert yet? No, we assert now).

    expect(renameFilesBtn.disabled).toBe(true)
    expect(renameFilesBtn.classList.add).toHaveBeenCalledWith('opacity-75', 'cursor-not-allowed')
    expect(renameFilesBtn.innerHTML).toContain('<svg') // Spinner presence

    // Finish the process
    resolveProcess([])
    await renamePromise

    // VERIFY RESET STATE
    expect(renameFilesBtn.disabled).toBe(false)
    expect(renameFilesBtn.classList.remove).toHaveBeenCalledWith('opacity-75', 'cursor-not-allowed')
    expect(renameFilesBtn.innerHTML).toBe('Apply Changes')
  })
})
