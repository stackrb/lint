import type { Linter } from 'eslint';

import { jsdoc } from 'eslint-plugin-jsdoc';
import { defineConfig } from 'eslint/config';

import { JS_FILES } from '../constants.js';

export function javascript(): Linter.Config[] {
  return defineConfig({
    extends: [jsdoc({ config: 'flat/recommended' })],
    files: [JS_FILES],
    name: 'stackrb/javascript',
  });
}
