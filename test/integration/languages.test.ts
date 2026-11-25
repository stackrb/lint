import { describe, expect, it } from 'vitest';
import { withProject } from './helpers.js';

describe('language plugins', () => {
  it('lints JSON, JSONC and JSON5 files with the json plugin', async () => {
    await withProject({}, async (project) => {
      await project.write('data/duplicate.json', '{ "alpha": 1, "alpha": 2 }\n');
      await project.write('data/duplicate.jsonc', '// leading comment\n{ "alpha": 1, "alpha": 2 }\n');
      await project.write('data/duplicate.json5', '{ alpha: 1, alpha: 2 }\n');
      await project.write('data/valid.json', '{ "alpha": 1 }\n');

      const results = await project.lint([
        'data/duplicate.json',
        'data/duplicate.jsonc',
        'data/duplicate.json5',
        'data/valid.json',
      ]);
      expect(results).toHaveLength(4);

      for (const name of ['duplicate.json', 'duplicate.jsonc', 'duplicate.json5']) {
        const result = results.find((entry) => entry.filePath.endsWith(name));
        expect(result?.messages.some((message) => message.ruleId === 'json/no-duplicate-keys')).toBe(true);
      }

      const valid = results.find((entry) => entry.filePath.endsWith('valid.json'));
      expect(valid?.errorCount).toBe(0);
    });
  });

  it('lints Markdown files with the markdown plugin', async () => {
    await withProject({}, async (project) => {
      await project.write('README.md', '# Title\n\n# Another title\n');

      const results = await project.lint(['README.md']);
      expect(results).toHaveLength(1);
      expect(results[0]?.messages.some((message) => message.ruleId === 'markdown/no-multiple-h1')).toBe(true);
    });
  });

  it('lints shell files with the shell plugin and its recommended rules', async () => {
    await withProject({}, async (project) => {
      await project.write('scripts/bad.sh', 'echo `pwd`\necho $HOME\n');
      await project.write('scripts/good.sh', 'echo "hello"\n');

      const results = await project.lint(['scripts/bad.sh', 'scripts/good.sh']);
      expect(results).toHaveLength(2);
      expect(
        results.find((entry) => entry.filePath.endsWith('bad.sh'))?.messages.some(
          (message) => message.ruleId === 'shell/no-backticks',
        ),
      ).toBe(true);
      expect(results.find((entry) => entry.filePath.endsWith('good.sh'))?.errorCount).toBe(0);
    });
  });
});
