import type { Linter } from 'eslint';

import { defineConfig } from 'eslint/config';
import globals from 'globals';

import { CODE_FILES } from '../constants.js';

export function nodeTarget(): Linter.Config[] {
  return defineConfig({
    files: [CODE_FILES],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.builtin,
      },
    },
    name: 'stackrb/target-node',
  });
}
