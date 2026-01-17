## 2026-01-17 - Hardcoded Remote Debugging Port
**Vulnerability:** The application was hardcoded to enable the Electron remote debugging port (`--remote-debugging-port=0`), which binds to a random available port.
**Learning:** This exposes the application to local (and potentially remote) RCE attacks, as the Chrome DevTools protocol allows arbitrary code execution. This is a common oversight when debugging configurations are accidentally committed.
**Prevention:** Never commit debugging switches. Use environment variables (e.g., `DEBUG_PORT`) or ensure such flags are stripped in production builds. Automated checks should scan for dangerous Electron flags.
