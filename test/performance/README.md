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
  `native` and `expo`, against a minimal flat-config baseline that only contains a
  `files` pattern and `languageOptions`.
- `lint-corpus.bench.ts` — `ESLint.lintFiles()` over a deterministic, generated
  corpus of 120 TypeScript/TSX files (imports, functions, classes, async code,
  JSX, spread across `src/`, `src/utils/`, `src/services/`, `src/components/` and
  `test/`), plus `lintText()` on one large generated file. Both use the
  `node`-target full config and the same minimal baseline (TS parser, no rules).
  ESLint instances are reused and run with `concurrency: 1`; warmup iterations
  absorb one-time config resolution, so the numbers reflect steady-state linting.

Ratios are printed as `full / baseline`; values above `1x` mean the full config is
slower. Results are stored in `sink` so engines cannot eliminate the work.

Fixtures are regenerated on every run in a fresh OS temp directory and removed
afterwards. Generation is seeded, so the corpus is byte-for-byte identical across
runs.

## Caveats

Numbers are heavily machine-dependent (CPU, thermals, Node version, OS, background
load) and depend on the built/source artifact being benchmarked. Compare ratios
within a single run, not absolute times across machines. Benchmarks live in a
separate Vitest project (`test.benchmark.include`) and are deliberately excluded
from the normal `npm test` run.
