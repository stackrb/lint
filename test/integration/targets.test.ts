import { describe, expect, it } from 'vitest';
import { withProject } from './helpers.js';

const TSX_SOURCE = `interface GreetingProps {
  readonly name: string;
}

export function Greeting({ name }: GreetingProps) {
  return <div className="greeting">Hello, {name}</div>;
}
`;

describe('target configs', () => {
  for (const target of ['node', 'browser', 'react', 'native', 'expo'] as const) {
    it(`loads and lints a TSX file with the ${target} target without throwing`, async () => {
      await withProject({ configOptions: { target } }, async (project) => {
        await project.write('src/Greeting.tsx', TSX_SOURCE);

        const results = await project.lint(['src/Greeting.tsx']);
        expect(results).toHaveLength(1);
        expect(results[0]?.filePath).toContain('Greeting.tsx');
        expect(results[0]?.messages.some((message) => Boolean(message.fatal))).toBe(false);
      });
    });
  }
});
