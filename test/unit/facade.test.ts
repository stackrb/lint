import packageJson from '../../package.json' with { type: 'json' };
import { describe, expect, it } from 'vitest';
import defaultConfig, { createConfig, plugin } from '../../src/index.js';
import { topLevelNames } from './helpers.js';

const PRESETS = ['browser', 'expo', 'native', 'node', 'react', 'recommended'] as const;

const GETTERS = [
  () => plugin.configs.browser,
  () => plugin.configs.expo,
  () => plugin.configs.native,
  () => plugin.configs.node,
  () => plugin.configs.react,
  () => plugin.configs.recommended,
];

describe('plugin facade', () => {
  it('exposes all preset configs', () => {
    expect(Object.keys(plugin.configs).sort()).toEqual([...PRESETS].sort());
  });

  it('exposes a non-empty config array for every preset', () => {
    for (const config of Object.values(plugin.configs)) {
      expect(config.length).toBeGreaterThan(0);
    }
  });

  it('exposes plugin metadata and no standalone rules', () => {
    expect(plugin.meta).toMatchObject({ name: '@stackrb/eslint-config', namespace: 'stackrb' });
    expect(plugin.meta.version).toBe(packageJson.version);
    expect(plugin.rules).toEqual({});
  });

  it('uses the default config for the recommended preset', () => {
    expect(plugin.configs.recommended).toBe(defaultConfig);
  });

  it('returns the same array on every preset access', () => {
    for (const get of GETTERS) {
      expect(get()).toBe(get());
    }
  });

  it('builds the react preset from the same config blocks as createConfig', () => {
    expect(topLevelNames(plugin.configs.react)).toEqual(topLevelNames(createConfig({ target: 'react' })));
  });
});
