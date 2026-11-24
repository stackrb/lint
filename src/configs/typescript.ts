import type { Linter } from 'eslint';

import { jsdoc } from 'eslint-plugin-jsdoc';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

import type { Options } from '../types.js';

import { TS_FILES } from '../constants.js';

export function typescriptConfig(options: Options = {}): Linter.Config[] {
  return defineConfig({
    extends: [
      tseslint.configs.recommended,
      jsdoc({ config: 'flat/recommended-tsdoc' }),
      ...(options.typed === true ? [tseslint.configs.recommendedTypeChecked] : []),
    ],
    files: [TS_FILES],
    languageOptions:
      options.typed === true
        ? {
            parserOptions: {
              projectService: true,
            },
          }
        : {},
    name: 'stackrb/typescript',
  });
}
