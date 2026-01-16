/**
 * @jest-environment jsdom
 */
/* eslint-env jest */
const fs = require('fs');
const path = require('path');

describe('Renderer Security', () => {
  let rendererScript;

  beforeAll(() => {
    rendererScript = fs.readFileSync(path.join(__dirname, '../public/renderer.js'), 'utf8');
  });

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <button id="select-folder"></button>
      <button id="rename-files"></button>
      <div id="file-list"></div>
      <div id="file-count"></div>
      <div id="preview-panel"></div>
      <select id="provider">
        <option value="ollama">Ollama</option>
      </select>
      <input id="model" value="llama3" />
      <select id="case">
        <option value="camelCase">camelCase</option>
      </select>
    `;

    // Mock electron API
    window.electron = {
      openDialog: jest.fn(),
      readDirectory: jest.fn(),
      processPath: jest.fn()
    };
  });

  test('should escape filenames in file list to prevent XSS', async () => {
    // Execute renderer script wrapped in IIFE to avoid global scope pollution/conflicts
    // We use eval to execute the string content of the file
    eval(`(() => { ${rendererScript} })()`);

    const selectFolderBtn = document.getElementById('select-folder');
    const fileList = document.getElementById('file-list');

    // Mock responses
    // Return a path
    window.electron.openDialog.mockResolvedValue('/tmp/test');
    // Return a file list with an XSS payload
    const xssPayload = '<img src=x onerror=alert(1)>';
    window.electron.readDirectory.mockResolvedValue(['normal.txt', xssPayload]);

    // Trigger the folder selection
    await selectFolderBtn.click();

    // Wait for event loop to process promises
    await new Promise(resolve => setTimeout(resolve, 0));

    // Verification
    // The innerHTML should NOT contain the raw tag
    // It SHOULD contain the escaped version
    const html = fileList.innerHTML;

    // Check that the script tag is not present as raw HTML (which would execute)
    // Note: checking if it contains the string '<img' might match the escaped version depending on how we check.
    // If it's escaped, it will be '&lt;img'.

    // Check that the XSS payload is not rendered as an actual HTML element
    const images = fileList.querySelectorAll('img');
    expect(images.length).toBe(0);

    // Verify the text content is escaped
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  test('should escape filenames in preview panel to prevent XSS', async () => {
     eval(`(() => { ${rendererScript} })()`);

     const renameFilesBtn = document.getElementById('rename-files');
     const previewPanel = document.getElementById('preview-panel');

     // Setup state (renderer.js uses `selectedFolderPath` variable which is local to the closure)
     // To test this, we must first trigger selectFolder to set the path variable
     const selectFolderBtn = document.getElementById('select-folder');
     window.electron.openDialog.mockResolvedValue('/tmp/test');
     window.electron.readDirectory.mockResolvedValue(['test.txt']);
     await selectFolderBtn.click();

     // Now trigger rename
     const xssPayload = '<script>alert(1)</script>';
     window.electron.processPath.mockResolvedValue([
         { oldName: 'test.txt', newName: xssPayload }
     ]);

     await renameFilesBtn.click();

     // Wait for event loop to process promises
     await new Promise(resolve => setTimeout(resolve, 0));

     const html = previewPanel.innerHTML;

     // Check that script tag is not executed/rendered as tag
     const scripts = previewPanel.querySelectorAll('script');
     expect(scripts.length).toBe(0);

     expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });
});
