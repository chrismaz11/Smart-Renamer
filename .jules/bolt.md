# Bolt's Journal
## 2025-05-15 - Concurrency Limiter Pattern
**Learning:** Sequential processing in file operations (especially with API calls) is a massive bottleneck. Implementing a simple concurrency limiter is safer and more effective than unchecked `Promise.all`.
**Action:** Use the `limitConcurrency` pattern in future tasks involving batch processing.
