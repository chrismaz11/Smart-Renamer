## 2025-05-23 - Renderer Stored XSS via Filenames
**Vulnerability:** Found `innerHTML` being used to render filenames obtained from `fs.readdir` in `public/renderer.js` without sanitization. Malicious filenames (e.g., `<img src=x onerror=alert(1)>`) could execute arbitrary JS in the renderer process.
**Learning:** Local filesystem data (like filenames) must be treated as untrusted user input when rendering to the DOM in Electron apps, just like remote API data.
**Prevention:** Always use `textContent` or an HTML escaping utility (like `escapeHtml`) when inserting strings into the DOM, even if the source is the local filesystem.
