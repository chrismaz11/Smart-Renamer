## 2026-01-21 - DOM XSS in Renderer
**Vulnerability:** User-controlled filenames were directly interpolated into `innerHTML` strings in `public/renderer.js`, allowing execution of malicious scripts if a file contained HTML tags (e.g., `<img src=x onerror=alert(1)>`).
**Learning:** The frontend uses vanilla JS with template literals for rendering, which does not automatically escape variables unlike frameworks like React or Vue. Testing this required setting up `jest-environment-jsdom` and evaluating the non-module script.
**Prevention:** Always use an `escapeHtml` helper function when interpolating data into `innerHTML`, or prefer `textContent` / `innerText` when possible.
