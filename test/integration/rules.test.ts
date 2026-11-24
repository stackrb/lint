import { describe, expect, it } from 'vitest';
import { ruleIds, ruleIsEnabled, withProject } from './helpers.js';

const DUPLICATE_TITLE_SOURCE = `import { describe, expect, it } from 'vitest';

describe('suite', () => {
  it('duplicate title', () => {
    expect(1).toBe(1);
  });
  it('duplicate title', () => {
    expect(2).toBe(2);
  });
});
`;

describe('rule selection', () => {
  it('applies Vitest rules to *.test.ts but not to ordinary source files', async () => {
    await withProject({}, async (project) => {
      await project.write('src/suite.test.ts', DUPLICATE_TITLE_SOURCE);
      await project.write('src/suite.ts', DUPLICATE_TITLE_SOURCE);

      const testIds = ruleIds(await project.lint(['src/suite.test.ts']));
      expect(testIds).toContain('vitest/no-identical-title');

      const sourceIds = ruleIds(await project.lint(['src/suite.ts']));
      expect(sourceIds).not.toContain('vitest/no-identical-title');
    });
  });

  it('disables n/no-unsupported-features/node-builtins for the browser target', async () => {
    await withProject({ configOptions: { target: 'browser' } }, async (project) => {
      await project.write('src/app.js', 'export const ok = 1;\n');
      const config = await project.configFor('src/app.js');
      expect(ruleIsEnabled(config.rules?.['n/no-unsupported-features/node-builtins'])).toBe(false);
    });

    await withProject({ configOptions: { target: 'node' } }, async (project) => {
      await project.write('src/app.js', 'export const ok = 1;\n');
      const config = await project.configFor('src/app.js');
      expect(ruleIsEnabled(config.rules?.['n/no-unsupported-features/node-builtins'])).toBe(true);
    });
  });
});
