import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    exclude: ['test/**/fixtures/**', 'test/performance/**'],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    pool: 'forks',
    benchmark: {
      include: ['test/performance/**/*.bench.ts'],
    },
  },
});
