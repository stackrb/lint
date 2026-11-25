import type { Linter } from 'eslint';

import eslintReact from '@eslint-react/eslint-plugin';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig } from 'eslint/config';

import { CODE_FILES } from '../constants.js';
import { BROWSER_GLOBALS } from './runtime.js';

/**
 * Builds React, React Hooks and JSX accessibility presets with browser globals.
 * @returns The React target config blocks.
 */
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
