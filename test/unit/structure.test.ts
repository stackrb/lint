import type { Linter } from 'eslint';
import { describe, expect, it } from 'vitest';
import {
  createConfig,
  type Target,
} from '../../src/index.js';
import { configNamed, isEnabled, pluginNames, ruleEntries } from './helpers.js';

const JS_FILES = '**/*.{js,jsx,mjs,cjs}';
const TS_FILES = '**/*.{ts,tsx,mts,cts}';
const CODE_FILES = '**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}';
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
    const [first] = configs;

    expect(first?.name).toMatch(/^globalIgnores/);
    expect(first?.ignores).toEqual(expect.arrayContaining(DEFAULT_IGNORES));
    expect(configs.slice(1).some((config) => config.ignores !== undefined)).toBe(false);
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
  });

  it('puts the Prettier config last in the default config', () => {
    expect(createConfig().at(-1)?.name).toBe('stackrb/prettier');
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
    ];

    for (const rule of expected) {
      expect(isEnabled(entries.get(rule)), rule).toBe(true);
    }
  });

  it('registers target plugins and enables their rules', () => {
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
        expect(isEnabled(entries.get(rule)), `${target}: rule ${rule}`).toBe(true);
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
