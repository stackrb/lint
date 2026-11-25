import { describe, expect, it } from 'vitest';
import { ruleIsEnabled } from '../shared/helpers.js';
import { ruleIds, withProject } from './helpers.js';

describe('Prettier compatibility', () => {
  it('disables stylistic rules that conflict with Prettier', async () => {
    await withProject({}, async (project) => {
      await project.write('src/formatted.ts', 'const value = "double quotes";\nexport { value };\n');

      const rules = (await project.configFor('src/formatted.ts')).rules ?? {};
      expect(ruleIsEnabled(rules['@stylistic/semi'])).toBe(false);
      expect(ruleIsEnabled(rules['@stylistic/quotes'])).toBe(false);
      expect(ruleIsEnabled(rules['semi'])).toBe(false);

      const ids = ruleIds(await project.lint(['src/formatted.ts']));
      expect(ids).not.toContain('@stylistic/semi');
      expect(ids).not.toContain('@stylistic/quotes');
    });
  });

  it('applies extraRules after Prettier so a stylistic rule can be re-enabled', async () => {
    await withProject(
      { configOptions: { extraRules: { '@stylistic/semi': ['error', 'never'] } } },
      async (project) => {
        await project.write('src/semicolon.ts', 'export const value = 1;\n');

        const rules = (await project.configFor('src/semicolon.ts')).rules ?? {};
        expect(ruleIsEnabled(rules['@stylistic/semi'])).toBe(true);
        expect(ruleIds(await project.lint(['src/semicolon.ts']))).toContain('@stylistic/semi');
      },
    );
  });
});
