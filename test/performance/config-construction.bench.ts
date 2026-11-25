import type { Linter } from 'eslint';
import { describe, test } from 'vitest';
import { createConfig } from '../../src/index.js';

// Local reference avoids Vite's per-access module getter in the hot loop.
const build = createConfig;

let sink: Linter.Config[] | undefined;

function minimalConfig(): Linter.Config[] {
  return [
    {
      files: ['**/*.{ts,tsx}'],
      languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    },
  ];
}

const RUN = {
  iterations: 150,
  time: 400,
  warmupIterations: 8,
  warmupTime: 80,
} as const;

describe('config construction', () => {
  test('createConfig() for each target vs a minimal flat config', async ({ bench }) => {
    const results = await bench.compare(
      bench('minimal config (baseline)', () => {
        sink = minimalConfig();
      }),
      bench('node', () => {
        sink = build({ target: 'node' });
      }),
      bench('browser', () => {
        sink = build({ target: 'browser' });
      }),
      bench('react', () => {
        sink = build({ target: 'react' });
      }),
      bench('native', () => {
        sink = build({ target: 'native' });
      }),
      bench('expo', () => {
        sink = build({ target: 'expo' });
      }),
      RUN,
    );

    const base = results.get('minimal config (baseline)').latency;
    console.log(`createConfig() construction — baseline ${base.mean.toFixed(4)} ms over ${base.samplesCount} samples`);
    for (const name of ['node', 'browser', 'react', 'native', 'expo'] as const) {
      const measured = results.get(name).latency;
      console.log(`  ${name}: ${measured.mean.toFixed(4)} ms (${(measured.mean / base.mean).toFixed(2)}x baseline, ${measured.samplesCount} samples)`);
    }
  });
});
