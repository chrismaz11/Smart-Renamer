/* eslint-env jest */
const fs = require('fs')
const path = require('path')
const vm = require('vm')

describe('Renderer UX', () => {
  let context
  let windowMock
  let documentMock
  let elements

  beforeEach(() => {
    elements = {}

    // Mock HTMLElement
    class HTMLElement {
      constructor (id) {
        this.id = id
        this.innerHTML = ''
        this.textContent = ''
        this.value = ''
        this.disabled = false
        this.classList = {
          add: jest.fn(),
          remove: jest.fn()
        }
        this.dataset = {}
        this.addEventListener = jest.fn((event, handler) => {
          this[`on${event}`] = handler
        })
        this.click = async () => {
          if (this.onclick) await this.onclick()
        }
      }
    }

    // Mock document
    documentMock = {
      getElementById: jest.fn((id) => {
        if (!elements[id]) {
          elements[id] = new HTMLElement(id)
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
      console
    }

    vm.createContext(context)

    // Read and eval renderer.js
    const rendererCode = fs.readFileSync(path.join(__dirname, '../public/renderer.js'), 'utf8')
    vm.runInContext(rendererCode, context)
  })

  test('Apply Changes button shows loading state during processing', async () => {
    const renameBtn = elements['rename-files']

    // Simulate folder selection so the click handler proceeds
    // renderer.js uses a local variable 'selectedFolderPath'.
    // We can simulate it being set by triggering the select folder button.
    const selectFolderBtn = elements['select-folder']
    windowMock.electron.openDialog.mockResolvedValue('/test/path')
    windowMock.electron.readDirectory.mockResolvedValue(['file1.txt'])
    await selectFolderBtn.click()

    // Mock processPath to take some time
    let resolveProcess
    const processPromise = new Promise(resolve => { resolveProcess = resolve })
    windowMock.electron.processPath.mockImplementation(async () => {
      await processPromise
      return [{ oldName: 'a', newName: 'b' }]
    })

    // Initial state
    expect(renameBtn.disabled).toBe(false)
    // We expect the button to not have the spinner initially
    expect(renameBtn.innerHTML).not.toContain('<svg')

    // Click button
    const clickPromise = renameBtn.click()

    // Check loading state immediately after click
    // This is what we want to implement
    expect(renameBtn.disabled).toBe(true)
    expect(renameBtn.classList.add).toHaveBeenCalledWith('cursor-not-allowed', 'opacity-75')
    expect(renameBtn.innerHTML).toContain('<svg') // Spinner

    // Finish processing
    resolveProcess()
    await clickPromise

    // Check restored state
    expect(renameBtn.disabled).toBe(false)
    expect(renameBtn.classList.remove).toHaveBeenCalledWith('cursor-not-allowed', 'opacity-75')
    expect(renameBtn.innerHTML).not.toContain('<svg')
  })
})
