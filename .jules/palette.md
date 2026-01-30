## 2024-05-22 - Async Button States
**Learning:** Users often double-click "Apply" buttons when there's no immediate visual feedback during async operations, leading to potential race conditions or errors.
**Action:** Always wrap async button handlers in a `try...finally` block with a `setLoading` helper that disables the button and shows a spinner.
