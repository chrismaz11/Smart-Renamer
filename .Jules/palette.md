## 2024-05-23 - Async Button States
**Learning:** Async buttons should always have a loading state to prevent double-submission and provide feedback.
**Action:** Always wrap async event handlers in try/finally blocks and use a setLoading helper to toggle disabled state and show a spinner.
