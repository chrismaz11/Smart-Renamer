/** @jest-environment jsdom */
/* eslint-env jest */
/* eslint-disable no-eval */

const fs = require('fs')
const path = require('path')

describe('renderer.js', () => {
  let rendererScript
  let html

  beforeAll(() => {
    html = fs.readFileSync(path.resolve(__dirname, '../public/index.html'), 'utf8')
    rendererScript = fs.readFileSync(path.resolve(__dirname, '../public/renderer.js'), 'utf8')
  })

  beforeEach(() => {
    document.documentElement.innerHTML = html

    // Mock window.electron
    window.electron = {
      openDialog: jest.fn(),
      readDirectory: jest.fn(),
      processPath: jest.fn().mockResolvedValue([])
    }
  })

  test('button shows loading state during processing', async () => {
    // Execute the script to attach listeners
    eval(rendererScript)

    const renameFilesBtn = document.getElementById('rename-files')
    const selectFolderBtn = document.getElementById('select-folder')

    // 1. Simulate selecting a folder to set 'selectedFolderPath'
    window.electron.openDialog.mockResolvedValue('/tmp/test-folder')
    window.electron.readDirectory.mockResolvedValue(['file1.txt'])

    // We can't await the event listener directly, but we can wait for the promise chain
    await selectFolderBtn.click()

    // Allow the async event loop to process the openDialog resolution
    await new Promise(resolve => setTimeout(resolve, 0))

    // 2. Prepare to verify loading state
    let buttonStateDuringCall
    window.electron.processPath.mockImplementation(async () => {
      buttonStateDuringCall = {
        disabled: renameFilesBtn.disabled,
        html: renameFilesBtn.innerHTML,
        classList: [...renameFilesBtn.classList]
      }
      return [] // Return empty results
    })

    // 3. Click Apply Changes
    await renameFilesBtn.click()

    // Allow the async event loop to process
    await new Promise(resolve => setTimeout(resolve, 0))

    // 4. Verify processPath was called
    expect(window.electron.processPath).toHaveBeenCalled()

    // 5. Verify button state DURING the call
    expect(buttonStateDuringCall).toBeDefined()
    expect(buttonStateDuringCall.disabled).toBe(true)
    expect(buttonStateDuringCall.html).toContain('Processing...')
    expect(buttonStateDuringCall.html).toContain('svg') // Check for spinner
    expect(buttonStateDuringCall.classList).toContain('cursor-not-allowed')

    // 6. Verify button state AFTER the call
    expect(renameFilesBtn.disabled).toBe(false)
    expect(renameFilesBtn.innerHTML).not.toContain('Processing...')
    expect(renameFilesBtn.classList).not.toContain('cursor-not-allowed')
  })
})
