import type { Linter } from 'eslint';

import vitest from '@vitest/eslint-plugin';
import prettierConfig from 'eslint-config-prettier/flat';
import { defineConfig, globalIgnores } from 'eslint/config';

import { DEFAULT_IGNORES, TEST_FILES } from '../constants.js';

export function ignores(extra: readonly string[] = []): Linter.Config[] {
  return [globalIgnores([...DEFAULT_IGNORES, ...extra], 'stackrb/ignores')];
}

export function prettier(): Linter.Config[] {
  return defineConfig({
    ...prettierConfig,
    name: 'stackrb/prettier',
  });
}

export function tests(): Linter.Config[] {
  return defineConfig({
    extends: [vitest.configs.recommended],
    files: [TEST_FILES],
    languageOptions: {
      globals: vitest.environments.env.globals,
    },
    name: 'stackrb/tests',
    plugins: { vitest },
  });
}
