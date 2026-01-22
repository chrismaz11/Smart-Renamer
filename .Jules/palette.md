## 2024-03-21 - Async Operation Feedback
**Learning:** Users lack visibility into long-running operations (like AI renaming), leading to potential double-clicks or confusion.
**Action:** Implement a reusable `setLoading(button, isLoading, text)` helper that disables the button, shows a spinner, and updates text, wrapped in a `try...finally` block to ensure reset.
