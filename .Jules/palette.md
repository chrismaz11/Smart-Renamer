## 2026-01-17 - Async Button Loading State Pattern
**Learning:** Adding loading states to async buttons is critical for user feedback and preventing duplicate submissions. In Vanilla JS without a framework, maintaining button state (original content vs loading content) can be achieved by storing the original innerHTML in a data attribute (e.g., `dataset.originalText`) before mutation.
**Action:** Use the `setLoading(button, isLoading, text)` helper pattern for future Vanilla JS async button implementations to standardize this behavior.
