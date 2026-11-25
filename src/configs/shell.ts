import type { ESLint, Linter } from 'eslint';

import shell from '@eslint/shell';
import { defineConfig } from 'eslint/config';

import { SHELL_FILES } from '../constants.js';

/**
 * Builds the shell language config, always enabling the plugin's recommended rules.
 * @returns The shell config blocks.
 */
export function shellConfig(): Linter.Config[] {
  return defineConfig({
    extends: ['shell/recommended'],
    files: [SHELL_FILES],
    name: 'stackrb/shell',
    // @eslint/shell ships its own ESLint types, which do not match ESLint 10's Plugin type.
    plugins: { shell: shell as unknown as ESLint.Plugin },
  });
}
