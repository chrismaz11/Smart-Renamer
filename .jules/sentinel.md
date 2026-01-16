## 2025-05-15 - Fixed DOM-based XSS in Renderer
**Vulnerability:** The renderer process used `innerHTML` to display filenames directly from the filesystem without sanitization. Malicious filenames containing HTML tags (e.g., `<img src=x onerror=alert(1)>`) could execute arbitrary JavaScript in the application context.
**Learning:** Even in desktop apps (Electron), data from the filesystem is "user input" and must be sanitized before rendering to the DOM.
**Prevention:** Always use textContent for untrusted text, or a sanitizer library/helper if HTML rendering is required. Implemented `escapeHtml` helper.
