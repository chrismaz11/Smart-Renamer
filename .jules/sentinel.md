## 2024-05-22 - XSS in Electron Renderer
**Vulnerability:** DOM-based XSS in Electron renderer process where filenames were injected directly into `innerHTML` without sanitization. Malicious filenames (e.g., `<img src=x onerror=alert(1)>`) could execute arbitrary JavaScript.
**Learning:** Developers often treat local filesystem data as trusted, but in a file manager context, filenames are user-controlled input and can be weaponized.
**Prevention:** Always escape HTML entities when injecting variable content into `innerHTML`, or prefer `textContent` for text-only nodes.
