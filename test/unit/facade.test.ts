import { describe, expect, it } from 'vitest';
import { plugin } from '../../src/index.js';

describe('plugin facade', () => {
  it('exposes all preset configs', () => {
    expect(Object.keys(plugin.configs).sort()).toEqual([
      'browser',
      'expo',
      'native',
      'node',
      'react',
      'recommended',
    ]);
  });

  it('exposes a non-empty config array for every preset', () => {
    for (const config of Object.values(plugin.configs)) {
      expect(config.length).toBeGreaterThan(0);
    }
  });

  it('exposes plugin metadata and no standalone rules', () => {
    expect(plugin.meta).toEqual({ name: '@stackrb/eslint-config' });
    expect(plugin.rules).toEqual({});
  });
});
