## 2024-05-23 - Micro-UX Improvements
**Learning:** Even simple async operations in Electron apps can feel unresponsive without immediate visual feedback. Users may double-click or assume the app is frozen.
**Action:** Always implement a loading state (spinner + disabled state) for any button that triggers an IPC call or async operation, ensuring it's reset in a `finally` block.
