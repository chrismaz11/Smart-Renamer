## 2025-02-18 - XSS in Renderer
**Vulnerability:** Unsanitized filenames rendered via `innerHTML` in Electron renderer.
**Learning:** Even local apps are vulnerable to XSS if they process user-controlled file metadata without sanitization. `innerHTML` is dangerous.
**Prevention:** Use textContent or an `escapeHtml` utility before interpolating strings into HTML.
