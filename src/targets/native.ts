import type { Linter } from 'eslint';

import reactNative from '@react-native/eslint-plugin';
import reactNativeGlobals from 'eslint-plugin-react-native-globals';
import { defineConfig } from 'eslint/config';

import { CODE_FILES } from '../constants.js';
import { reactTarget } from './react.js';

export function nativeTarget(): Linter.Config[] {
  return defineConfig([
    ...reactTarget(),
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
