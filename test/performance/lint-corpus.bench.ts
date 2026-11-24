import parser from '@typescript-eslint/parser';
import { ESLint } from 'eslint';
import type { Linter } from 'eslint';
import { afterAll, describe, test } from 'vitest';
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
  iterations: 3,
  time: 0,
  warmupIterations: 1,
  warmupTime: 0,
} as const;

let sink: ESLint.LintResult[] | undefined;

describe('lint throughput', () => {
  test('lintFiles over the generated corpus', async ({ bench }) => {
    const results = await bench.compare(
      bench('minimal config (baseline)', async () => {
        sink = await minimalLinter.lintFiles([...corpus.files]);
      }),
      bench('full config (node target)', async () => {
        sink = await fullLinter.lintFiles([...corpus.files]);
      }),
      RUN,
    );

    const baseMs = results.get('minimal config (baseline)').latency.mean;
    const fullMs = results.get('full config (node target)').latency.mean;
    console.log(`lintFiles over ${corpus.files.length} generated files — ${RUN.iterations} iterations`);
    console.log(`  minimal config: ${baseMs.toFixed(2)} ms`);
    console.log(`  full config: ${fullMs.toFixed(2)} ms (${(fullMs / baseMs).toFixed(2)}x baseline)`);
  });

  test('lintText on one large generated file', async ({ bench }) => {
    const results = await bench.compare(
      bench('minimal config (baseline)', async () => {
        sink = await minimalLinter.lintText(corpus.largeSource, { filePath: corpus.largeFilePath });
      }),
      bench('full config (node target)', async () => {
        sink = await fullLinter.lintText(corpus.largeSource, { filePath: corpus.largeFilePath });
      }),
      RUN,
    );

    const baseMs = results.get('minimal config (baseline)').latency.mean;
    const fullMs = results.get('full config (node target)').latency.mean;
    console.log('lintText on a large file — 3 iterations');
    console.log(`  minimal config: ${baseMs.toFixed(2)} ms`);
    console.log(`  full config: ${fullMs.toFixed(2)} ms (${(fullMs / baseMs).toFixed(2)}x baseline)`);
  });
});
