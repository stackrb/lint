import type { Linter } from 'eslint';

import expo from 'eslint-plugin-expo';
import { defineConfig } from 'eslint/config';

import { CODE_FILES } from '../constants.js';
import { nativeTarget } from './native.js';

export function expoTarget(): Linter.Config[] {
  return defineConfig([
    ...nativeTarget(),
    {
      files: [CODE_FILES],
      name: 'stackrb/target-expo',
      plugins: { expo },
      rules: {
        'expo/no-dynamic-env-var': 'error',
        'expo/no-env-var-destructuring': 'error',
        'expo/prefer-box-shadow': 'warn',
        'expo/use-dom-exports': 'error',
      },
    },
  ]);
}
