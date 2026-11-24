import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';
import { createConfig } from '../../src/index.js';
import { hasGc, heapUsedBytes, mb, mean } from './helpers.js';

const SOURCE = 'const answer = 42;\nexport function double(n) { return n * 2; }\n';
const ITERATIONS = 40;
const SAMPLE_EVERY = 5;

describe('ESLint instance memory', () => {
  it('does not retain memory unboundedly across fresh instances linting the same text', async () => {
    const config = createConfig({ target: 'node' });

    // Warm up parsers/rules before taking the baseline sample.
    for (let i = 0; i < 3; i += 1) {
      await new ESLint({ overrideConfig: config, overrideConfigFile: true }).lintText(SOURCE, { filePath: 'sample.js' });
    }

    const samples: number[] = [];
    for (let i = 0; i < ITERATIONS; i += 1) {
      const eslint = new ESLint({ overrideConfig: config, overrideConfigFile: true });
      const results = await eslint.lintText(SOURCE, { filePath: 'sample.js' });
      expect(results).toHaveLength(1);
      if (i % SAMPLE_EVERY === 0) {
        samples.push(heapUsedBytes());
      }
    }
    samples.push(heapUsedBytes());

    const half = Math.floor(samples.length / 2);
    const early = mean(samples.slice(0, half));
    const late = mean(samples.slice(-half));

    console.log(`[memory] ESLint gc=${hasGc() ? 'on' : 'off'} early=${mb(early)} late=${mb(late)} n=${ITERATIONS}`);
    expect(late).toBeLessThan(early * 3);
  });
});
