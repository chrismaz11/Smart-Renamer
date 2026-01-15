## 2025-05-18 - Unchecked IPC Path Access
**Vulnerability:** The Electron main process exposed `fs.readdir` and file processing logic via IPC (`read-directory`, `process-path`) without validating that the requested path was authorized by the user (e.g., via `openDialog`).
**Learning:** In Electron, `ipcMain` handlers are trusted boundaries. Never blindly trust paths sent from the renderer, even if you trust your own frontend code, as XSS can bypass frontend checks.
**Prevention:** Maintain a session state in the main process (e.g., `allowedDirectory`) derived from trusted sources (like `dialog.showOpenDialog`) and validate all subsequent IPC requests against this state.
