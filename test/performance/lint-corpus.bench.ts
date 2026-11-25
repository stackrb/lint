import parser from '@typescript-eslint/parser';
import { ESLint } from 'eslint';
import type { Linter } from 'eslint';
import { afterAll, beforeAll, describe, test } from 'vitest';
import { createConfig } from '../../src/index.js';
import { cleanupCorpus, getCorpus } from './fixtures.js';

const corpus = getCorpus();
afterAll(cleanupCorpus);

const minimalConfig: Linter.Config[] = [
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { parser },
  },
];

const fullConfig = createConfig({ target: 'node' });

function makeLinter(config: Linter.Config[]): ESLint {
  return new ESLint({
    cwd: corpus.dir,
    overrideConfigFile: true,
    overrideConfig: config,
    // "off" avoids worker threads and their cloneable-options requirement.
    concurrency: 'off',
  });
}

const minimalLinter = makeLinter(minimalConfig);
const fullLinter = makeLinter(fullConfig);

const RUN = {
  iterations: 10,
  time: 1_000,
  warmupIterations: 3,
  warmupTime: 300,
} as const;

// Ten slow lint passes plus warmup exceed Vitest's 60s benchmark-mode timeout floor.
const TEST_TIMEOUT = 180_000;

let sink: ESLint.LintResult[] | undefined;

beforeAll(async () => {
  // Fail early if a generated fixture cannot be parsed; otherwise the numbers measure error paths.
  const results = await fullLinter.lintFiles([...corpus.files]);
  const fatal = results.reduce((total, result) => total + result.fatalErrorCount, 0);
  if (fatal > 0) {
    throw new Error(`Generated corpus has ${fatal} fatal parse errors`);
  }
  sink = results;
});

describe('lint throughput', () => {
  test('lintFiles over the generated corpus', { timeout: TEST_TIMEOUT }, async ({ bench }) => {
    const results = await bench.compare(
      bench('minimal config (baseline)', async () => {
        sink = await minimalLinter.lintFiles([...corpus.files]);
      }),
      bench('full config (node target)', async () => {
        sink = await fullLinter.lintFiles([...corpus.files]);
      }),
      RUN,
    );

    const base = results.get('minimal config (baseline)').latency;
    const full = results.get('full config (node target)').latency;
    console.log(`lintFiles over ${corpus.files.length} generated files — ${base.samplesCount} / ${full.samplesCount} samples`);
    console.log(`  minimal config: ${base.mean.toFixed(2)} ms`);
    console.log(`  full config: ${full.mean.toFixed(2)} ms (${(full.mean / base.mean).toFixed(2)}x baseline)`);
  });

  test('lintText on one large generated file', { timeout: TEST_TIMEOUT }, async ({ bench }) => {
    const results = await bench.compare(
      bench('minimal config (baseline)', async () => {
        sink = await minimalLinter.lintText(corpus.largeSource, { filePath: corpus.largeFilePath });
      }),
      bench('full config (node target)', async () => {
        sink = await fullLinter.lintText(corpus.largeSource, { filePath: corpus.largeFilePath });
      }),
      RUN,
    );

    const base = results.get('minimal config (baseline)').latency;
    const full = results.get('full config (node target)').latency;
    console.log(`lintText on a large file — ${base.samplesCount} / ${full.samplesCount} samples`);
    console.log(`  minimal config: ${base.mean.toFixed(2)} ms`);
    console.log(`  full config: ${full.mean.toFixed(2)} ms (${(full.mean / base.mean).toFixed(2)}x baseline)`);
  });
});
