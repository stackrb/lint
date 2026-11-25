import type { Linter } from 'eslint';

import vitest from '@vitest/eslint-plugin';
import prettierConfig from 'eslint-config-prettier/flat';
import { defineConfig, globalIgnores } from 'eslint/config';

import { DEFAULT_IGNORES, TEST_FILES } from '../constants.js';

/**
 * Builds the global-ignores block from the default patterns plus extras.
 * @param extra - Additional glob patterns to ignore.
 * @returns The named global-ignores block.
 */
export function ignores(extra: readonly string[] = []): Linter.Config[] {
  return [globalIgnores([...DEFAULT_IGNORES, ...extra], 'stackrb/ignores')];
}

/**
 * Builds the final compatibility config that disables stylistic rule conflicts.
 * @returns The Prettier compatibility block.
 */
export function prettier(): Linter.Config[] {
  return defineConfig({
    ...prettierConfig,
    name: 'stackrb/prettier',
  });
}

/**
 * Builds Vitest rules and globals for test files.
 * @returns The test-file config blocks.
 */
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
