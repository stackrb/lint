import type { Linter } from 'eslint';

import vitest from '@vitest/eslint-plugin';
import { defineConfig } from 'eslint/config';

import { TEST_FILES } from '../constants.js';

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
