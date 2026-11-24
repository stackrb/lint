import type { Linter } from 'eslint';

import { globalIgnores } from 'eslint/config';

import { DEFAULT_IGNORES } from '../constants.js';

export function ignores(extra: readonly string[] = []): Linter.Config[] {
  return [globalIgnores([...DEFAULT_IGNORES, ...extra])];
}
