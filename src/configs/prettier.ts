import type { Linter } from 'eslint';

import prettier from 'eslint-config-prettier/flat';
import { defineConfig } from 'eslint/config';

export function prettierConfig(): Linter.Config[] {
  return defineConfig({
    ...prettier,
    name: 'stackrb/prettier',
  });
}
