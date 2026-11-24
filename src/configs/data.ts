import type { Linter } from 'eslint';

import json from '@eslint/json';
import depend from 'eslint-plugin-depend';
import { defineConfig } from 'eslint/config';

import type { Options } from '../types.js';

import { bannedDependenciesRule } from './depend.js';

export function data(options: Options = {}): Linter.Config[] {
  const jsonConfig = {
    extends: ['json/recommended'],
    files: ['**/*.json'],
    language: 'json/json',
    name: 'stackrb/json',
    plugins: { json },
  };

  if (options.bannedDependencies?.length) {
    Object.assign(jsonConfig, {
      plugins: { depend, json },
      rules: bannedDependenciesRule(options.bannedDependencies),
    });
  }

  return defineConfig([
    jsonConfig,
    {
      extends: ['json/recommended'],
      files: ['**/*.jsonc'],
      language: 'json/jsonc',
      name: 'stackrb/jsonc',
      plugins: { json },
    },
    {
      extends: ['json/recommended'],
      files: ['**/*.json5'],
      language: 'json/json5',
      name: 'stackrb/json5',
      plugins: { json },
    },
  ]);
}
