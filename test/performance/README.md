# Performance benchmarks

Run with:

```bash
npm run test:perf
# or: npx vitest bench --run test/performance --reporter=verbose
```

`--reporter=verbose` shows the custom ratio logs and Vitest's per-benchmark table;
the default reporter hides `console.log` output from passing benchmarks.

## What is measured

- `config-construction.bench.ts` — `createConfig()` for `node`, `browser`, `react`,
  `native` and `expo`, against a baseline that is a **single** object literal
  (`files` + `languageOptions`). A full target config is assembled from multiple
  config objects with plugins and rule sets, so these ratios compare "build a
  real config" with "allocate one tiny object" rather than two equivalent APIs.
  Read them as construction cost, not as an end-to-end lint-speed speedup.
- `lint-corpus.bench.ts` — `ESLint.lintFiles()` over a deterministic, generated
  corpus of 120 TypeScript/TSX files (imports, functions, classes, async code,
  JSX, spread across `src/`, `src/utils/`, `src/services/`, `src/components/` and
  `test/`), plus `lintText()` on one large generated file. Both use the
  `node`-target full config and a minimal baseline (TS parser only, no rules).
  A pre-flight check asserts that the generated corpus has zero fatal parse
  errors. ESLint instances are reused with `concurrency: 'off'`: ESLint 10 worker
  threads need cloneable plugin objects, which these configs are not, so linting
  runs in-process and sequentially. Warmup absorbs one-time config resolution.

Ratios are printed as `full / baseline`; values above `1x` mean the full config is
slower. Results are stored in `sink` so engines cannot eliminate the work.

Each custom log prints the **actual** sample count from
`result.latency.samplesCount`, not the configured `iterations`. tinybench runs
until both the iteration count and the time budget have been met, so fast tasks
can collect far more samples than the configured minimum.

Both benchmarks import `../../src/index.js`, i.e. the TypeScript source as
transformed by Vite, **not** the built `dist/` artifact. Published-package
performance will differ; use these numbers for relative comparison during
development only.

## Configuration

`lint-corpus` uses 10 iterations, a 1000 ms time budget, 3 warmup iterations and
a 300 ms warmup budget per task. Three samples gave unstable estimates on this
suite (over 100% relative margin of error on the `lintText` baseline); ten trades
a longer run for a narrower confidence interval. The full-config `lintFiles`
benchmark dominates total runtime because each lint pass is expensive.

## Caveats

Numbers are heavily machine-dependent (CPU, thermals, Node version, OS,
background load) and depend on the built/source artifact being benchmarked.
Compare ratios within a single run, not absolute times across machines or
against numbers recorded here. Benchmarks live in a separate Vitest project
(`test.benchmark.include`) and are deliberately excluded from the normal
`npm test` run.

Fixtures are regenerated on every run in a fresh OS temp directory and removed
afterwards. Generation is seeded, so the corpus is byte-for-byte identical
across runs.
