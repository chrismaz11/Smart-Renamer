## 2025-01-09 - Remove Remote Debugging Port and Harden Electron Security
**Vulnerability:** The application was initializing with `remote-debugging-port` set to '0' (random port), which exposes the application to remote debugging and potential RCE.
**Learning:** Debugging flags should never be left in production code. Electron applications default to insecure settings if not explicitly configured.
**Prevention:** Always audit `app.commandLine` switches and ensure `webPreferences` includes `contextIsolation: true` and `sandbox: true`.
