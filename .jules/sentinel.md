## 2024-05-23 - Stored XSS in File Rendering
**Vulnerability:** File names were rendered directly into the DOM using `innerHTML` without sanitization. This allowed execution of arbitrary JavaScript if a file name contained HTML tags (e.g., `<img src=x onerror=alert(1)>`).
**Learning:** Even local desktop applications are vulnerable to XSS if they display file system data that can be influenced by external sources (e.g., downloaded files). `innerHTML` should always be treated with suspicion.
**Prevention:** Always use `textContent` when possible, or sanitize input using an `escapeHtml` function before inserting it into the DOM via `innerHTML`.
