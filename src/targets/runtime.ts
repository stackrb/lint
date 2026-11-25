import type { Linter } from 'eslint';

import { defineConfig } from 'eslint/config';
import globals from 'globals';

import { CODE_FILES } from '../constants.js';

// Frozen so a consumer mutating one returned config cannot affect other targets or cached presets.
export const BROWSER_GLOBALS = Object.freeze({ ...globals.browser, ...globals.builtin });
const NODE_GLOBALS = Object.freeze({ ...globals.node, ...globals.builtin });

export function node(): Linter.Config[] {
  return defineConfig({
    files: [CODE_FILES],
    languageOptions: {
      globals: NODE_GLOBALS,
    },
    name: 'stackrb/target-node',
  });
}

export function browser(): Linter.Config[] {
  return defineConfig({
    files: [CODE_FILES],
    languageOptions: {
      globals: BROWSER_GLOBALS,
    },
    name: 'stackrb/target-browser',
    rules: {
      'n/no-unsupported-features/node-builtins': 'off',
    },
  });
}
