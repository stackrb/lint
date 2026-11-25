import type { Linter } from 'eslint';

import reactNative from '@react-native/eslint-plugin';
import expoPlugin from 'eslint-plugin-expo';
import reactNativeGlobals from 'eslint-plugin-react-native-globals';
import { defineConfig } from 'eslint/config';

import { CODE_FILES } from '../constants.js';
import { react } from './react.js';

export function native(): Linter.Config[] {
  return defineConfig([
    ...react(),
    {
      files: [CODE_FILES],
      languageOptions: {
        globals: reactNativeGlobals.environments.all.globals,
      },
      name: 'stackrb/target-native',
      plugins: { 'react-native': reactNative },
      rules: {
        'react-native/no-deep-imports': 'error',
        'react-native/platform-colors': 'error',
      },
    },
  ]);
}

export function expo(): Linter.Config[] {
  return defineConfig([
    ...native(),
    {
      files: [CODE_FILES],
      name: 'stackrb/target-expo',
      plugins: { expo: expoPlugin },
      rules: {
        'expo/no-dynamic-env-var': 'error',
        'expo/no-env-var-destructuring': 'error',
        'expo/prefer-box-shadow': 'warn',
        'expo/use-dom-exports': 'error',
      },
    },
  ]);
}
