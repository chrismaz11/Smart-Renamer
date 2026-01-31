## 2024-05-22 - Missing Async Feedback
**Learning:** The application performs long-running operations (file renaming via AI) without providing visual feedback on the action button itself, leading to potential double-submissions and uncertainty.
**Action:** Always implement a `setLoading` state for buttons triggering async operations, disabling interaction and showing a spinner/status text.
