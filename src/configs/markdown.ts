import type { Linter } from 'eslint';

import markdown from '@eslint/markdown';
import { defineConfig } from 'eslint/config';

export function markdownConfig(): Linter.Config[] {
  return defineConfig({
    extends: ['markdown/recommended'],
    files: ['**/*.md'],
    language: 'markdown/gfm',
    name: 'stackrb/markdown',
    plugins: { markdown },
  });
}
