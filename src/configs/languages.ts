import type { Linter } from 'eslint';

import json from '@eslint/json';
import eslintMarkdown from '@eslint/markdown';
import depend from 'eslint-plugin-depend';
import { jsdoc } from 'eslint-plugin-jsdoc';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

import type { Options } from '../types.js';

import { JS_FILES, TS_FILES } from '../constants.js';
import { bannedDependenciesRule } from './base.js';

/**
 * Builds JSDoc rules for JavaScript files.
 * @returns The JavaScript config blocks.
 */
export function javascript(): Linter.Config[] {
  return defineConfig({
    extends: [jsdoc({ config: 'flat/recommended' })],
    files: [JS_FILES],
    name: 'stackrb/javascript',
  });
}

/**
 * Builds TypeScript rules, optionally with type-aware checks.
 * @param options - Set `typed` to enable `parserOptions.projectService`.
 * @returns The TypeScript config blocks.
 */
export function typescript(options: Options = {}): Linter.Config[] {
  return defineConfig({
    extends: [
      tseslint.configs.recommended,
      jsdoc({ config: 'flat/recommended-tsdoc' }),
      ...(options.typed === true ? [tseslint.configs.recommendedTypeChecked] : []),
    ],
    files: [TS_FILES],
    ...(options.typed === true && { languageOptions: { parserOptions: { projectService: true } } }),
    name: 'stackrb/typescript',
  });
}

const JSON_LANGUAGES = [
  { extension: 'json', language: 'json/json' },
  { extension: 'jsonc', language: 'json/jsonc' },
  { extension: 'json5', language: 'json/json5' },
] as const;

/**
 * Builds the JSON, JSONC and JSON5 language configs.
 * @param options - Banned dependencies are enforced on `.json` files only.
 * @returns The data-file config blocks.
 */
export function data(options: Options = {}): Linter.Config[] {
  const banned = options.bannedDependencies?.length ? bannedDependenciesRule(options.bannedDependencies) : undefined;

  return defineConfig(
    JSON_LANGUAGES.map(({ extension, language }): Linter.Config => {
      const common = {
        extends: ['json/recommended'],
        files: [`**/*.${extension}`],
        language,
        name: `stackrb/${extension}`,
      };

      return extension === 'json' && banned !== undefined
        ? { ...common, plugins: { depend, json }, rules: banned }
        : { ...common, plugins: { json } };
    }),
  );
}

/**
 * Builds the GFM Markdown config.
 * @returns The Markdown config blocks.
 */
export function markdown(): Linter.Config[] {
  return defineConfig({
    extends: ['markdown/recommended'],
    files: ['**/*.md'],
    language: 'markdown/gfm',
    name: 'stackrb/markdown',
    plugins: { markdown: eslintMarkdown },
  });
}
