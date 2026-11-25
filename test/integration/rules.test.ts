import { describe, expect, it } from 'vitest';
import { ruleIsEnabled } from '../shared/helpers.js';
import { ruleIds, withProject } from './helpers.js';

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

  it('keeps code-only extraRules out of JSON and Markdown linting', async () => {
    await withProject(
      { configOptions: { extraRules: { 'n/no-missing-import': 'error' } } },
      async (project) => {
        await project.write('data/valid.json', '{ "alpha": 1 }\n');
        await project.write('README.md', '# Title\n\nSome prose.\n');

        const results = await project.lint(['data/valid.json', 'README.md']);
        expect(results).toHaveLength(2);
        for (const result of results) {
          expect(result.messages.some((message) => Boolean(message.fatal))).toBe(false);
          expect(ruleIds([result])).not.toContain('n/no-missing-import');
        }
      },
    );
  });
});
