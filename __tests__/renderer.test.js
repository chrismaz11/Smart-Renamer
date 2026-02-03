/* eslint-env jest */
const fs = require('fs')
const path = require('path')
const vm = require('vm')

const rendererPath = path.join(__dirname, '../public/renderer.js')
const rendererCode = fs.readFileSync(rendererPath, 'utf8')

describe('renderer.js', () => {
  let context
  let documentMock
  let windowMock
  let elements

  beforeEach(() => {
    elements = {}

    // Mock HTMLElement
    class HTMLElementMock {
      constructor () {
        this.dataset = {}
        this.classList = {
          add: jest.fn(),
          remove: jest.fn()
        }
        this.addEventListener = jest.fn((event, handler) => {
          this[`on${event}`] = handler
        })
        this.value = ''
        this.innerHTML = ''
      }
    }

    // Mock document
    documentMock = {
      getElementById: jest.fn((id) => {
        if (!elements[id]) {
          elements[id] = new HTMLElementMock()
          elements[id].id = id
          if (id === 'rename-files') {
            elements[id].innerHTML = 'Apply Changes'
          }
          if (id === 'provider' || id === 'case') {
            elements[id].value = 'mock-value'
          }
          if (id === 'model') {
            elements[id].value = 'mock-model'
          }
        }
        return elements[id]
      })
    }

    // Mock window
    windowMock = {
      electron: {
        openDialog: jest.fn(),
        readDirectory: jest.fn(),
        processPath: jest.fn()
      }
    }

    context = {
      document: documentMock,
      window: windowMock,
      console,
      HTMLElement: HTMLElementMock
    }

    vm.createContext(context)
    vm.runInContext(rendererCode, context)
  })

  test('loading state is applied when renaming files', async () => {
    const renameBtn = elements['rename-files']
    const selectFolderBtn = elements['select-folder']

    // Simulate folder selection to set selectedFolderPath
    windowMock.electron.openDialog.mockResolvedValue('/mock/path')
    windowMock.electron.readDirectory.mockResolvedValue(['file1.txt'])
    await selectFolderBtn.onclick()

    // Setup mock for processPath
    let resolveProcess
    const processPromise = new Promise(resolve => { resolveProcess = resolve })
    windowMock.electron.processPath.mockReturnValue(processPromise)

    // Trigger rename click
    const clickPromise = renameBtn.onclick()

    // Assert loading state
    // We expect the button to be disabled and show a spinner
    expect(renameBtn.disabled).toBe(true)
    expect(renameBtn.innerHTML).toContain('animate-spin')

    // Finish the process
    resolveProcess([])
    await clickPromise

    // Assert restored state
    expect(renameBtn.disabled).toBe(false)
    expect(renameBtn.innerHTML).toBe('Apply Changes')
  })
})
