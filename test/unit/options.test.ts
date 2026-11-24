import { describe, expect, it } from 'vitest';
import { createConfig, type Options } from '../../src/index.js';
import { configNamed } from './helpers.js';

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

  it('adds the type-checked preset when typed is true', () => {
    const names = createConfig({ typed: true }).map((config) => config.name);

    expect(names).toContain('stackrb/typescript > typescript-eslint/recommended-type-checked');
    expect(createConfig().map((config) => config.name)).not.toContain(
      'stackrb/typescript > typescript-eslint/recommended-type-checked',
    );
  });

  it('appends extraIgnores to the global ignores', () => {
    const ignores = createConfig({ extraIgnores: ['generated/**', '*.tmp'] })[0]?.ignores;

    expect(ignores).toEqual(expect.arrayContaining(['**/node_modules/**', 'generated/**', '*.tmp']));
    expect(ignores?.at(-2)).toBe('generated/**');
    expect(ignores?.at(-1)).toBe('*.tmp');
  });

  it('applies extraRules after the other presets, including Prettier', () => {
    const rules = { 'no-console': 'off', '@stylistic/quotes': 'error' } as const;
    const configs = createConfig({ extraRules: rules });

    expect(configs.at(-1)).toMatchObject({ name: 'stackrb/overrides', rules });
    expect(configs.at(-2)?.name).toBe('stackrb/prettier');
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

    expect(rules).toMatchObject({
      'deprecate/function': ['error', { name: 'oldFunction' }],
      'deprecate/import': ['error', { name: 'oldImport', use: 'newImport' }],
      'deprecate/member-expression': ['error', { name: 'oldMember' }],
    });
  });

  it('groups several deprecations of the same kind into one rule', () => {
    const rules = configNamed(
      createConfig({ deprecations: [{ name: 'first' }, { name: 'second', use: 'third' }] }),
      'stackrb/base',
    ).rules;

    expect(rules?.['deprecate/function']).toEqual(['error', { name: 'first' }, { name: 'second', use: 'third' }]);
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

    expect(configNamed(configs, 'stackrb/extra-globals').languageOptions?.globals).toEqual({
      customGlobal: 'readonly',
    });
    expect(configs.at(-2)?.name).toBe('stackrb/extra-globals');
    expect(Object.fromEntries(globals)).toMatchObject({ customGlobal: 'readonly' });
  });
});
