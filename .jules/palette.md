## 2025-05-15 - Async Button State Management
**Learning:** In this Vanilla JS frontend, async actions on buttons lacked feedback, leading to potential double-submissions and user confusion.
**Action:** Implement a reusable `setLoading(button, isLoading, text)` helper that toggles `disabled` state, adds visual transparency (`opacity-75`), and injects a standard SVG spinner. Always use `try...finally` to ensure state restoration.
