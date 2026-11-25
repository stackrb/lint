import { describe, expect, it } from 'vitest';
import { createConfig, type Options } from '../../src/index.js';
import { ruleIsEnabled } from '../shared/helpers.js';
import { configNamed, ruleEntries, topLevelNames } from './helpers.js';

function hasFloatingPromiseRule(options: Options): boolean {
  return ruleIsEnabled(ruleEntries(createConfig(options)).get('@typescript-eslint/no-floating-promises'));
}

describe('createConfig options', () => {
  it('uses the default Node version when none is given', () => {
    expect(configNamed(createConfig(), 'stackrb/base').settings).toMatchObject({
      node: { version: '>=20.19.0' },
    });
  });

  it('sets settings.node.version from nodeVersion', () => {
    expect(configNamed(createConfig({ nodeVersion: '22.14.0' }), 'stackrb/base').settings).toMatchObject({
      node: { version: '22.14.0' },
    });
  });

  it('adds parserOptions.projectService when typed is true', () => {
    const typed = configNamed(createConfig({ typed: true }), 'stackrb/typescript');
    const untyped = configNamed(createConfig(), 'stackrb/typescript');

    expect(typed.languageOptions?.parserOptions).toEqual({ projectService: true });
    expect(untyped.languageOptions?.parserOptions).toBeUndefined();
  });

  it('enables type-checked rules only when typed is true', () => {
    expect(hasFloatingPromiseRule({ typed: true })).toBe(true);
    expect(hasFloatingPromiseRule({})).toBe(false);
  });

  it('appends extraIgnores to the global ignores', () => {
    const ignores = createConfig({ extraIgnores: ['generated/**', '*.tmp'] }).flatMap(
      (config) => config.ignores ?? [],
    );

    expect(ignores).toEqual(
      expect.arrayContaining(['**/node_modules/**', '**/dist/**', 'generated/**', '*.tmp']),
    );
  });

  it('applies extraRules after the other presets, including Prettier', () => {
    const rules = { 'no-console': 'off', '@stylistic/quotes': 'error' } as const;
    const configs = createConfig({ extraRules: rules });
    const names = topLevelNames(configs);

    expect(configs.find((config) => config.name === 'stackrb/overrides')).toMatchObject({ rules });
    expect(names.indexOf('stackrb/overrides')).toBeGreaterThan(names.indexOf('stackrb/prettier'));
    expect(names.indexOf('stackrb/overrides')).toBeGreaterThan(names.indexOf('stackrb/base'));
  });

  it('creates deprecate rules keyed by deprecation kind', () => {
    const rules = configNamed(
      createConfig({
        deprecations: [
          { name: 'oldFunction' },
          { name: 'oldImport', use: 'newImport', kind: 'import' },
          { name: 'oldMember', kind: 'member-expression' },
        ],
      }),
      'stackrb/base',
    ).rules;

    expect(rules?.['deprecate/function']).toEqual(['error', 'oldFunction']);
    expect(rules?.['deprecate/import']).toEqual(['error', { name: 'oldImport', use: 'newImport' }]);
    expect(rules?.['deprecate/member-expression']).toEqual(['error', 'oldMember']);
  });

  it('groups several deprecations of the same kind into one rule', () => {
    const rules = configNamed(
      createConfig({ deprecations: [{ name: 'first' }, { name: 'second', use: 'third' }] }),
      'stackrb/base',
    ).rules;

    expect(rules?.['deprecate/function']).toEqual(['error', 'first', { name: 'second', use: 'third' }]);
  });

  it('bans dependencies in both code and JSON configs', () => {
    const modules = ['lodash', 'underscore'];
    const configs = createConfig({ bannedDependencies: modules });

    expect(configNamed(configs, 'stackrb/base').rules).toMatchObject({
      'depend/ban-dependencies': ['error', { modules }],
    });
    expect(configNamed(configs, 'stackrb/json').rules).toMatchObject({
      'depend/ban-dependencies': ['error', { modules }],
    });
    expect(configNamed(createConfig(), 'stackrb/base').rules).not.toHaveProperty('depend/ban-dependencies');
  });

  it('emits every requested target for a target array', () => {
    const names = createConfig({ target: ['node', 'browser', 'react', 'native', 'expo'] }).map((config) => config.name);

    for (const target of ['node', 'browser', 'react', 'native', 'expo']) {
      expect(names).toContain(`stackrb/target-${target}`);
    }
  });

  it('emits one block per cumulative target when a target implies the others', () => {
    const names = createConfig({ target: ['native', 'expo'] }).map((config) => config.name);

    for (const name of ['stackrb/target-react', 'stackrb/target-native', 'stackrb/target-expo']) {
      expect(names.filter((entry) => entry === name), name).toHaveLength(1);
    }
  });

  it('emits both independent targets exactly once', () => {
    const names = createConfig({ target: ['node', 'browser'] }).map((config) => config.name);

    for (const name of ['stackrb/target-node', 'stackrb/target-browser']) {
      expect(names.filter((entry) => entry === name), name).toHaveLength(1);
    }
  });

  it('defaults to the node target for undefined or empty targets', () => {
    const cases: readonly Options[] = [{}, { target: [] }];

    for (const options of cases) {
      const names = createConfig(options).map((config) => config.name);

      expect(names).toContain('stackrb/target-node');
      expect(names).not.toContain('stackrb/target-browser');
    }
  });

  it('merges extraGlobals into the emitted language globals', () => {
    const configs = createConfig({ target: 'node', extraGlobals: { customGlobal: 'readonly' } });
    const globals = configs.flatMap((config) => Object.entries(config.languageOptions?.globals ?? {}));
    const names = topLevelNames(configs);

    expect(configNamed(configs, 'stackrb/extra-globals').languageOptions?.globals).toEqual({
      customGlobal: 'readonly',
    });
    expect(names.indexOf('stackrb/extra-globals')).toBeGreaterThan(names.indexOf('stackrb/target-node'));
    expect(names.indexOf('stackrb/extra-globals')).toBeLessThan(names.indexOf('stackrb/prettier'));
    expect(Object.fromEntries(globals)).toMatchObject({ customGlobal: 'readonly' });
  });
});
