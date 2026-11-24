import type { Linter } from 'eslint';

import { defineConfig } from 'eslint/config';
import globals from 'globals';

import { CODE_FILES } from '../constants.js';

export function browserTarget(): Linter.Config[] {
  return defineConfig({
    files: [CODE_FILES],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.builtin,
      },
    },
    name: 'stackrb/target-browser',
    rules: {
      'n/no-unsupported-features/node-builtins': 'off',
    },
  });
}
