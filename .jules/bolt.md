## 2024-05-23 - Deadlock in Recursive Concurrency
**Learning:** When adding concurrency limits to recursive functions (like directory traversal), NEVER wrap the recursive call itself in the limiter if it shares the same limit instance. This causes a deadlock where parent tasks wait for child tasks, but child tasks can't start because parent tasks hold all the slots.
**Action:** Only limit the "leaf" operations (the actual file processing) and let the recursion happen freely, or use separate limiters/queues for different depths (though that's complex).
