import type { Linter } from 'eslint';

import eslintReact from '@eslint-react/eslint-plugin';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig } from 'eslint/config';

import { CODE_FILES } from '../constants.js';
import { BROWSER_GLOBALS } from './runtime.js';

export function react(): Linter.Config[] {
  return defineConfig({
    extends: [
      eslintReact.configs['recommended-typescript'],
      reactHooks.configs.flat.recommended,
      jsxA11y.flatConfigs.recommended,
    ],
    files: [CODE_FILES],
    languageOptions: {
      globals: BROWSER_GLOBALS,
    },
    name: 'stackrb/target-react',
  });
}
