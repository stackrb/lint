import type { Linter } from 'eslint';
import { describe, expect, it } from 'vitest';
import { createConfig, type Options, type Target } from '../../src/index.js';
import { hasGc, heapUsedBytes, mb, mean } from './helpers.js';

const TARGETS: readonly Target[] = ['node', 'browser', 'react', 'native', 'expo'];
const ITERATIONS = 200;
const SAMPLE_EVERY = 25;

function optionsFor(index: number): Options {
  const target = TARGETS[index % TARGETS.length];
  return target === undefined ? {} : { target };
}

function structure(configs: readonly Linter.Config[]): string {
  return JSON.stringify(
    configs.map((config) => ({
      // The ignores block may be renamed or numbered; identify it by its contents.
      name: config.ignores === undefined ? (config.name ?? null) : null,
      ignores: config.ignores === undefined ? null : [...config.ignores],
      rules: config.rules === undefined ? null : Object.keys(config.rules).sort(),
    })),
  );
}

describe('createConfig memory', () => {
  it('does not grow the heap unboundedly across repeated calls for every target', () => {
    // Warm up module/JIT caches so the baseline is not first-call cost.
    for (let i = 0; i < 8; i += 1) {
      createConfig(optionsFor(i));
    }

    const samples: number[] = [];
    for (let i = 0; i < ITERATIONS; i += 1) {
      createConfig(optionsFor(i));
      if (i % SAMPLE_EVERY === 0) {
        samples.push(heapUsedBytes());
      }
    }
    samples.push(heapUsedBytes());

    const half = Math.floor(samples.length / 2);
    const early = mean(samples.slice(0, half));
    const late = mean(samples.slice(-half));

    console.log(`[memory] createConfig gc=${hasGc() ? 'on' : 'off'} early=${mb(early)} late=${mb(late)} n=${ITERATIONS}`);
    expect(late).toBeLessThan(early * 3);
  });

  it('does not mutate module-level state visible in config structure', () => {
    const options = { target: ['node', 'react'] } as const;
    const first = structure(createConfig(options));

    for (let i = 0; i < ITERATIONS; i += 1) {
      createConfig(optionsFor(i));
    }

    expect(structure(createConfig(options))).toBe(first);
  });
});
