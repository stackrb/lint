# Memory tests

Bounded heap-growth checks for `createConfig()` and repeated ESLint instances.
They catch unbounded retention (a leak), not exact byte counts.

## Run

```sh
npx vitest run test/memory
```

With GC exposed, so samples are taken after a forced collection and are much
quieter:

```sh
NODE_OPTIONS=--expose-gc npx vitest run test/memory
```

`global.gc?.()` is used when present; without it the tests still run, just with
noisier numbers. Each test logs its early/late heap averages in MB.

## What is covered

- `create-config.memory.test.ts` — 200 `createConfig()` calls cycling through all
  five targets, plus a check that config structure (names and rule keys) is
  identical for the first and last call.
- `eslint-instances.memory.test.ts` — 40 fresh `ESLint` instances using one shared
  config, each linting the same source text.

Both suites warm up first, then compare the mean heap of the early samples with
the mean of the late samples. Results are discarded so the tests themselves do
not retain what they measure.

## Why bounded assertions

`process.memoryUsage().heapUsed` depends on JIT warmup, GC timing, plugin module
loading, Node version and the CI machine. Absolute thresholds (for example
"must stay under 200 MB") would fail on different runners or after unrelated
dependency updates. The assertions instead require late averages to stay below
3x the early baseline: large enough to ignore normal noise, small enough to
catch growth that keeps accumulating with every iteration.
