import type { Linter } from 'eslint';

import deslint from '@deslint/eslint-plugin';
import eslintComments from '@eslint-community/eslint-plugin-eslint-comments';
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import typescriptEslintParser from '@typescript-eslint/parser';
import deMorgan from 'eslint-plugin-de-morgan';
import depend from 'eslint-plugin-depend';
import deprecate from 'eslint-plugin-deprecate';
import node from 'eslint-plugin-n';
import perfectionist from 'eslint-plugin-perfectionist';
import promise from 'eslint-plugin-promise';
import regexp from 'eslint-plugin-regexp';
import security from 'eslint-plugin-security';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import { defineConfig } from 'eslint/config';

import type { DeprecationKind, DeprecationRule, Options } from '../types.js';

import { CODE_FILES, DEFAULT_NODE_VERSION } from '../constants.js';

export function bannedDependenciesRule(modules: readonly string[]): Linter.RulesRecord {
  return { 'depend/ban-dependencies': ['error', { modules: [...modules] }] };
}

const DEPRECATION_KINDS: Record<DeprecationKind, true> = {
  function: true,
  import: true,
  'member-expression': true,
};

function deprecateRules(deprecations: readonly DeprecationRule[]): Linter.RulesRecord {
  const rules: Linter.RulesRecord = {};

  for (const item of deprecations) {
    const kind = item.kind ?? 'function';
    if (!Object.hasOwn(DEPRECATION_KINDS, kind)) {
      continue;
    }

    const name = `deprecate/${kind}`;
    // eslint-plugin-deprecate@0.9 rejects object options without `use`; bare strings are accepted.
    const option = item.use === undefined ? item.name : { name: item.name, use: item.use };
    const current = rules[name];
    const previous: unknown[] = Array.isArray(current) ? current.slice(1) : [];
    rules[name] = ['error', ...previous, option];
  }

  return rules;
}

/**
 * Builds the shared base config: TypeScript parser, Node settings and common plugin presets.
 * @param options - Node version, deprecation and dependency-ban options.
 * @returns The base config blocks.
 */
export function base(options: Options = {}): Linter.Config[] {
  const rules: Linter.RulesRecord = {};

  if (options.bannedDependencies?.length) {
    Object.assign(rules, bannedDependenciesRule(options.bannedDependencies));
  }

  if (options.deprecations?.length) {
    Object.assign(rules, deprecateRules(options.deprecations));
  }

  return defineConfig({
    extends: [
      'js/recommended',
      'n/recommended-module',
      deslint.configs.recommended,
      deMorgan.configs.recommended,
      sonarjs.configs.recommended,
      security.configs.recommended,
      regexp.configs.recommended,
      promise.configs['flat/recommended'],
      perfectionist.configs['recommended-natural'],
      unicorn.configs.recommended,
      stylistic.configs.recommended,
    ],
    files: [CODE_FILES],
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    name: 'stackrb/base',
    plugins: {
      '@eslint-community/eslint-comments': eslintComments,
      '@stylistic': stylistic,
      depend,
      deprecate,
      js,
      n: node,
      unicorn,
    },
    rules: {
      '@eslint-community/eslint-comments/no-duplicate-disable': 'error',
      '@eslint-community/eslint-comments/no-unlimited-disable': 'error',
      '@eslint-community/eslint-comments/no-unused-enable': 'error',
      // jsdoc/check-alignment adds the asterisks this Unicorn rule strips, so
      // enabling both creates circular autofixes in downstream projects.
      'unicorn/no-asterisk-prefix-in-documentation-comments': 'off',
      ...rules,
    },
    settings: {
      node: { version: options.nodeVersion ?? DEFAULT_NODE_VERSION },
    },
  });
}
