import type { Linter } from 'eslint';
import { describe, expect, it } from 'vitest';
import { createConfig, type Target } from '../../src/index.js';
import { ruleIsEnabled } from '../shared/helpers.js';
import { configNamed, pluginNames, ruleEntries, topLevelNames } from './helpers.js';

const JS_FILES = '**/*.{js,jsx,mjs,cjs}';
const TS_FILES = '**/*.{ts,tsx,mts,cts}';
const CODE_FILES = '**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}';
const SHELL_FILES = '**/*.{sh,bash}';
const TEST_FILES = '**/*.{test,spec}.{js,jsx,mjs,cjs,ts,tsx,mts,cts}';

const DEFAULT_IGNORES = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/coverage/**',
  '**/.vitest/**',
  '**/test/results/**',
  '**/cache/**',
  'package-lock.json',
  '.cache-dist-bak',
];

const TARGETS: readonly Target[] = ['node', 'browser', 'react', 'native', 'expo'];

describe('config structure', () => {
  it('names every config it emits', () => {
    for (const target of TARGETS) {
      for (const config of createConfig({ target })) {
        expect(config.name, `${target} config name`).toBeTruthy();
      }
    }
  });

  it('starts with global ignores containing the defaults', () => {
    const configs = createConfig();
    const ignores = configs.find((config) => config.ignores !== undefined);

    expect(configs[0]?.ignores).toEqual(expect.arrayContaining(DEFAULT_IGNORES));
    expect(ignores?.ignores).toEqual(expect.arrayContaining(DEFAULT_IGNORES));
    expect(configs.slice(1).some((config) => config.ignores !== undefined)).toBe(false);
  });

  it('emits all config blocks in the documented order when every option is set', () => {
    const configs = createConfig({
      target: ['node', 'browser', 'react', 'native', 'expo'],
      nodeVersion: '22.14.0',
      typed: true,
      extraIgnores: ['generated/**'],
      deprecations: [{ name: 'legacyFunction' }],
      bannedDependencies: ['lodash'],
      extraGlobals: { customGlobal: 'readonly' },
      extraRules: { 'no-console': 'off' },
    });

    expect(topLevelNames(configs)).toEqual([
      'stackrb/base',
      'stackrb/javascript',
      'stackrb/typescript',
      'stackrb/tests',
      'stackrb/json',
      'stackrb/jsonc',
      'stackrb/json5',
      'stackrb/markdown',
      'stackrb/shell',
      'stackrb/target-node',
      'stackrb/target-browser',
      'stackrb/target-react',
      'stackrb/target-native',
      'stackrb/target-expo',
      'stackrb/extra-globals',
      'stackrb/prettier',
      'stackrb/overrides',
    ]);
    expect(configs.find((config) => config.ignores !== undefined)?.ignores).toEqual(
      expect.arrayContaining([...DEFAULT_IGNORES, 'generated/**']),
    );
  });

  it('uses the expected file globs for each language and test config', () => {
    const configs = createConfig();

    expect(configNamed(configs, 'stackrb/base').files).toEqual([CODE_FILES]);
    expect(configNamed(configs, 'stackrb/javascript').files).toEqual([JS_FILES]);
    expect(configNamed(configs, 'stackrb/typescript').files).toEqual([TS_FILES]);
    expect(configNamed(configs, 'stackrb/tests').files).toEqual([TEST_FILES]);
    expect(configNamed(configs, 'stackrb/json').files).toEqual(['**/*.json']);
    expect(configNamed(configs, 'stackrb/jsonc').files).toEqual(['**/*.jsonc']);
    expect(configNamed(configs, 'stackrb/json5').files).toEqual(['**/*.json5']);
    expect(configNamed(configs, 'stackrb/markdown').files).toEqual(['**/*.md']);
    expect(configNamed(configs, 'stackrb/shell').files).toEqual([SHELL_FILES]);
  });

  it('puts the Prettier config after every other block in the default config', () => {
    const names = topLevelNames(createConfig());
    const prettierIndex = names.indexOf('stackrb/prettier');

    expect(prettierIndex).toBeGreaterThan(-1);
    const otherNames = names.filter((entry) => entry !== 'stackrb/prettier');
    for (const name of otherNames) {
      expect(names.indexOf(name), name).toBeLessThan(prettierIndex);
    }
  });

  it('registers the base plugins', () => {
    const expected = [
      'js',
      'unicorn',
      'depend',
      'deprecate',
      'n',
      '@stylistic',
      '@eslint-community/eslint-comments',
      'jsdoc',
      '@typescript-eslint',
      'vitest',
      'json',
      'markdown',
      'shell',
      'deslint',
      'de-morgan',
      'sonarjs',
      'security',
      'regexp',
      'promise',
      'perfectionist',
    ];

    expect([...pluginNames(createConfig())].sort()).toEqual([...expected].sort());
  });

  it('enables a representative rule from every base plugin', () => {
    const entries = ruleEntries(
      createConfig({
        deprecations: [{ name: 'legacyFunction' }],
        bannedDependencies: ['lodash'],
      }),
    );
    const expected = [
      'no-empty',
      'unicorn/error-message',
      'depend/ban-dependencies',
      'deprecate/function',
      'n/no-missing-import',
      '@stylistic/list-style',
      '@eslint-community/eslint-comments/no-duplicate-disable',
      'deslint/no-eval',
      'de-morgan/no-negated-conjunction',
      'sonarjs/code-eval',
      'security/detect-eval-with-expression',
      'regexp/prefer-plus-quantifier',
      'promise/always-return',
      'perfectionist/sort-imports',
      'jsdoc/check-param-names',
      '@typescript-eslint/no-explicit-any',
      'vitest/expect-expect',
      'json/no-duplicate-keys',
      'markdown/require-alt-text',
      'shell/no-backticks',
    ];

    for (const rule of expected) {
      expect(ruleIsEnabled(entries.get(rule)), rule).toBe(true);
    }
  });

  it('reports unused disable directives from the base config', () => {
    expect(configNamed(createConfig(), 'stackrb/base').linterOptions).toMatchObject({
      reportUnusedDisableDirectives: true,
    });
  });

  it('turns off the Unicorn documentation asterisk rule', () => {
    expect(ruleEntries(createConfig()).get('unicorn/no-asterisk-prefix-in-documentation-comments')).toBe('off');
  });

  it('always enables the shell plugin recommended config', () => {
    const configs = createConfig();
    const recommended = configNamed(configs, 'stackrb/shell > shell/recommended');

    expect(recommended.language).toBe('shell/bash');
    expect(recommended.rules).toHaveProperty('shell/no-backticks', 'error');
    expect(ruleIsEnabled(ruleEntries(configs).get('shell/no-backticks'))).toBe(true);
  });

  it('registers target plugins and scopes their configs to code files', () => {
    const cases: ReadonlyArray<{
      readonly target: Target;
      readonly plugins: readonly string[];
      readonly rules: readonly string[];
    }> = [
      { target: 'node', plugins: [], rules: [] },
      { target: 'browser', plugins: [], rules: [] },
      {
        target: 'react',
        plugins: ['@eslint-react', 'react-hooks', 'jsx-a11y'],
        rules: ['@eslint-react/dom-no-dangerously-set-innerhtml', 'react-hooks/rules-of-hooks', 'jsx-a11y/alt-text'],
      },
      {
        target: 'native',
        plugins: ['react-native'],
        rules: ['react-native/no-deep-imports', 'react-native/platform-colors'],
      },
      { target: 'expo', plugins: ['expo'], rules: ['expo/no-env-var-destructuring', 'expo/no-dynamic-env-var'] },
    ];

    for (const { target, plugins, rules } of cases) {
      const configs = createConfig({ target });
      const names = pluginNames(configs);
      const entries = ruleEntries(configs);

      expect(configNamed(configs, `stackrb/target-${target}`).files, target).toEqual([CODE_FILES]);
      for (const plugin of plugins) {
        expect(names.has(plugin), `${target}: plugin ${plugin}`).toBe(true);
      }
      for (const rule of rules) {
        expect(ruleIsEnabled(entries.get(rule)), `${target}: rule ${rule}`).toBe(true);
      }
    }
  });

  it('installs runtime globals for the node and browser targets', () => {
    const node = configNamed(createConfig({ target: 'node' }), 'stackrb/target-node');
    const browser = configNamed(createConfig({ target: 'browser' }), 'stackrb/target-browser');
    const nodeGlobals: Linter.Config['languageOptions'] = node.languageOptions;
    const browserGlobals: Linter.Config['languageOptions'] = browser.languageOptions;

    expect(nodeGlobals?.globals).toHaveProperty('process');
    expect(browserGlobals?.globals).toHaveProperty('window');
  });
});
