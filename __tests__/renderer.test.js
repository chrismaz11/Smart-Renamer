/* eslint-env jest */
const fs = require('fs')
const path = require('path')
const vm = require('vm')

describe('Renderer Logic', () => {
  let sandbox
  let windowMock
  let documentMock
  let renameBtn
  let previewPanel
  let selectFolderBtn
  let fileList
  let fileCount
  let providerSelect
  let modelInput
  let caseSelect

  beforeEach(() => {
    // Setup DOM elements
    renameBtn = {
      addEventListener: jest.fn(),
      innerHTML: 'Apply Changes',
      dataset: {},
      classList: {
        add: jest.fn(),
        remove: jest.fn()
      }
    }

    selectFolderBtn = { addEventListener: jest.fn() }
    fileList = { innerHTML: '' }
    fileCount = { textContent: '' }
    previewPanel = { innerHTML: '' }
    providerSelect = { value: 'ollama' }
    modelInput = { value: 'llama3' }
    caseSelect = { value: 'camelCase' }

    documentMock = {
      getElementById: jest.fn((id) => {
        if (id === 'rename-files') return renameBtn
        if (id === 'select-folder') return selectFolderBtn
        if (id === 'file-list') return fileList
        if (id === 'file-count') return fileCount
        if (id === 'preview-panel') return previewPanel
        if (id === 'provider') return providerSelect
        if (id === 'model') return modelInput
        if (id === 'case') return caseSelect
        return null
      })
    }

    windowMock = {
      electron: {
        openDialog: jest.fn(),
        readDirectory: jest.fn(),
        processPath: jest.fn()
      }
    }

    sandbox = {
      document: documentMock,
      window: windowMock,
      console
    }

    vm.createContext(sandbox)
  })

  test('clicking rename button triggers loading state', async () => {
    const rendererCode = fs.readFileSync(path.join(__dirname, '../public/renderer.js'), 'utf8')
    vm.runInContext(rendererCode, sandbox)

    // Simulate selecting a folder
    const selectFolderHandler = selectFolderBtn.addEventListener.mock.calls.find(call => call[0] === 'click')[1]
    windowMock.electron.openDialog.mockResolvedValue('/tmp/test-folder')
    windowMock.electron.readDirectory.mockResolvedValue(['file1.txt'])
    await selectFolderHandler()

    // Mock processPath to hang for a bit
    let resolveProcess
    const processPromise = new Promise(resolve => { resolveProcess = resolve })
    windowMock.electron.processPath.mockReturnValue(processPromise)

    // Trigger rename
    const renameHandler = renameBtn.addEventListener.mock.calls.find(call => call[0] === 'click')[1]
    const clickPromise = renameHandler()

    // VERIFY LOADING STATE
    expect(renameBtn.disabled).toBe(true)
    expect(renameBtn.classList.add).toHaveBeenCalledWith('opacity-75', 'cursor-not-allowed')
    expect(renameBtn.innerHTML).toContain('<svg')
    expect(renameBtn.innerHTML).toContain('Renaming...')
    expect(renameBtn.dataset.originalText).toBe('Apply Changes')

    // Resolve the promise
    resolveProcess([])
    await clickPromise

    // VERIFY RESET STATE
    expect(renameBtn.disabled).toBe(false)
    expect(renameBtn.classList.remove).toHaveBeenCalledWith('opacity-75', 'cursor-not-allowed')
    expect(renameBtn.innerHTML).toBe('Apply Changes')
  })
})
