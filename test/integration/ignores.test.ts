import { describe, expect, it } from 'vitest';
import { withProject } from './helpers.js';

describe('global ignores', () => {
  it('skips dist/, node_modules/, coverage/ and extraIgnores patterns', async () => {
    await withProject(
      { configOptions: { extraIgnores: ['**/generated/**', 'legacy/**'] } },
      async (project) => {
        const paths = [
          'dist/bundle.js',
          'node_modules/dependency/index.js',
          'coverage/report.js',
          'generated/api.js',
          'legacy/old.js',
          'src/kept.js',
        ];
        for (const path of paths) {
          await project.write(path, 'export const value = 1;\n');
        }

        for (const ignored of paths.slice(0, -1)) {
          expect(await project.isIgnored(ignored)).toBe(true);
        }
        expect(await project.isIgnored('src/kept.js')).toBe(false);

        const linted = (await project.lint(['.'])).map((result) => result.filePath);
        expect(linted.some((path) => path.includes('/dist/'))).toBe(false);
        expect(linted.some((path) => path.includes('/node_modules/'))).toBe(false);
        expect(linted.some((path) => path.includes('/coverage/'))).toBe(false);
        expect(linted.some((path) => path.includes('/generated/'))).toBe(false);
        expect(linted.some((path) => path.includes('/legacy/'))).toBe(false);
        expect(linted.some((path) => path.endsWith('/src/kept.js'))).toBe(true);
      },
    );
  });
});
