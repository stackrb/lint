import { describe, expect, it } from 'vitest';
import { ruleIds, withProject } from './helpers.js';

describe('consumer config file', () => {
  it('lints JS and TS through eslint.config.mjs and reports expected diagnostics', async () => {
    await withProject({ configOptions: { target: 'node' } }, async (project) => {
      await project.write('src/index.js', "const orphan = 1;\nconsole.log('hello');\n");
      await project.write(
        'src/util.ts',
        'export function add(a: number, b: number): number {\n  const unused = a;\n  return a + b;\n}\n',
      );

      const results = await project.lint(['src/index.js', 'src/util.ts']);
      expect(results).toHaveLength(2);
      expect(results.every((result) => result.filePath.startsWith(project.dir))).toBe(true);

      const ids = ruleIds(results);
      expect(ids).toContain('no-unused-vars');
      expect(ids).toContain('deslint/no-prod-console');
      expect(ids).toContain('@typescript-eslint/no-unused-vars');

      const jsResult = results.find((result) => result.filePath.endsWith('src/index.js'));
      expect(
        jsResult?.messages.some((message) => message.ruleId === 'no-unused-vars' && message.severity === 2),
      ).toBe(true);

      const tsResult = results.find((result) => result.filePath.endsWith('src/util.ts'));
      expect(tsResult?.messages.some((message) => message.ruleId === '@typescript-eslint/no-unused-vars')).toBe(
        true,
      );
    });
  });

  it('honors options embedded in the temp config file', async () => {
    await withProject(
      { configOptions: { target: 'node', extraRules: { 'no-unused-vars': 'off' } } },
      async (project) => {
        await project.write('src/index.js', 'const orphan = 1;\nexport const kept = 2;\n');

        const ids = ruleIds(await project.lint(['src/index.js']));
        expect(ids).not.toContain('no-unused-vars');
      },
    );
  });
});
