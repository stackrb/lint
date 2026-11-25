import { defineConfig } from 'eslint/config';
import config from './dist/index.js';

export default defineConfig([
  { ignores: ['examples/**', '.agents/**'] },
  ...config,
  {
    files: ['src/**/*.{js,mjs,cjs,ts,tsx,mts,cts}'],
    rules: {
      // This repo omits JSDoc on internal helpers; the published config still enforces it.
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/require-param-description': 'off',
      'jsdoc/check-alignment': 'off',
      // Exported-first ordering hurts readability; keep declaration order instead.
      'perfectionist/sort-modules': 'off',
      'security/detect-object-injection': 'off',
    },
  },
  {
    files: ['test/**/*.ts', '*.config.ts', '*.config.mjs'],
    rules: {
      // Test fixtures and build configs are not published source; keep them readable.
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-objects': 'off',
      'perfectionist/sort-object-types': 'off',
      'perfectionist/sort-named-exports': 'off',
      'perfectionist/sort-exports': 'off',
      'perfectionist/sort-modules': 'off',
      'perfectionist/sort-interfaces': 'off',
      'unicorn/import-style': 'off',
      'unicorn/name-replacements': 'off',
      'unicorn/numeric-separators-style': 'off',
      'unicorn/no-array-sort': 'off',
      'unicorn/require-array-sort-compare': 'off',
      'unicorn/no-top-level-assignment-in-function': 'off',
      'unicorn/no-unreadable-for-of-expression': 'off',
      'sonarjs/assertions-in-tests': 'off',
      'vitest/valid-expect': 'off',
      // The published config enables Playwright on every test file; these suites use Vitest,
      // so a Playwright-only rule about expect placement does not apply here.
      'playwright/no-standalone-expect': 'off',
      'unicorn/no-null': 'off',
      'unicorn/single-line-block-comment-style': 'off',
      'unicorn/no-await-expression-member': 'off',
      'unicorn/no-incorrect-template-string-interpolation': 'off',
      'unicorn/no-useless-boolean-cast': 'off',
      'unicorn/consistent-boolean-name': 'off',
      'unicorn/prefer-includes-over-repeated-comparisons': 'off',
      'unicorn/prefer-early-return': 'off',
      '@stylistic/list-style': 'off',
      'n/no-extraneous-import': 'off',
      'jsdoc/require-jsdoc': 'off',
      'unicorn/catch-error-name': 'off',
      'unicorn/no-unsafe-string-replacement': 'off',
      'perfectionist/sort-union-types': 'off',
    },
  },
  {
    files: ['test/performance/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^sink$' }],
    },
  },
]);
