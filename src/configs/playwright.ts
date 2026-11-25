import type { Linter } from 'eslint';

import playwright from 'eslint-plugin-playwright';
import { defineConfig } from 'eslint/config';

import { TEST_FILES } from '../constants.js';

/**
 * Builds Playwright rules for test files, always enabling the recommended preset.
 * @returns The Playwright config blocks.
 */
export function playwrightConfig(): Linter.Config[] {
  return defineConfig({
    extends: [playwright.configs['flat/recommended']],
    files: [TEST_FILES],
    name: 'stackrb/playwright',
  });
}
