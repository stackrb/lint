import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';
import { createConfig, type Options } from '../../src/index.js';

async function ruleIds(text: string, filePath: string, options?: Options): Promise<string[]> {
  const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: createConfig(options) });
  const [result] = await eslint.lintText(text, { filePath });

  return result?.messages.flatMap((message) => (message.ruleId === null ? [] : [message.ruleId])) ?? [];
}

describe('linting behavior', () => {
  it('reports a sonarjs diagnostic', async () => {
    const ids = await ruleIds('const value = eval(input);\nexport { value };\n', 'sonar.js');

    expect(ids).toContain('sonarjs/code-eval');
  });

  it('reports a security diagnostic', async () => {
    const ids = await ruleIds('const value = eval(input);\nexport { value };\n', 'security.js');

    expect(ids).toContain('security/detect-eval-with-expression');
  });

  it('reports a regexp diagnostic', async () => {
    const ids = await ruleIds('const re = /a{1,}/;\nexport { re };\n', 'regexp.js');

    expect(ids).toContain('regexp/prefer-plus-quantifier');
  });

  it('reports a promise diagnostic', async () => {
    const ids = await ruleIds('p.then(() => { console.log("x") });\n', 'promise.js');

    expect(ids).toContain('promise/always-return');
  });

  it('reports a unicorn diagnostic', async () => {
    const ids = await ruleIds('throw new Error();\n', 'unicorn.js');

    expect(ids).toContain('unicorn/error-message');
  });

  it('reports a jsdoc diagnostic in JavaScript', async () => {
    const ids = await ruleIds('/** @param {string} bar */\nfunction f(foo) { return foo }\n', 'jsdoc-js.js');

    expect(ids).toContain('jsdoc/check-param-names');
  });

  it('reports a jsdoc diagnostic in TypeScript', async () => {
    const ids = await ruleIds(
      '/** @param {string} bar */\nfunction f(foo: string): string { return foo }\n',
      'jsdoc-ts.ts',
    );

    expect(ids).toContain('jsdoc/check-param-names');
  });

  it('reports a typescript-eslint diagnostic', async () => {
    const ids = await ruleIds('const x: any = 1;\nexport { x };\n', 'typescript.ts');

    expect(ids).toContain('@typescript-eslint/no-explicit-any');
  });

  it('reports a json diagnostic', async () => {
    const ids = await ruleIds('{"a":1,"a":2}\n', 'data.json');

    expect(ids).toContain('json/no-duplicate-keys');
  });

  it('reports a markdown diagnostic', async () => {
    const ids = await ruleIds('# Title\n\n![](image.png)\n', 'readme.md');

    expect(ids).toContain('markdown/require-alt-text');
  });

  it('reports a vitest diagnostic in a test file', async () => {
    const ids = await ruleIds('it("does nothing", () => {});\n', 'sample.test.js');

    expect(ids).toContain('vitest/expect-expect');
  });

  it('reports a React diagnostic', async () => {
    const ids = await ruleIds(
      'const Bad = () => <div dangerouslySetInnerHTML={{ __html: "x" }} />;\nexport default Bad;\n',
      'component.jsx',
      { target: 'react' },
    );

    expect(ids).toContain('@eslint-react/dom-no-dangerously-set-innerhtml');
  });

  it('reports an Expo diagnostic', async () => {
    const ids = await ruleIds('const { API_URL } = process.env;\nconsole.log(API_URL);\n', 'app.js', {
      target: 'expo',
    });

    expect(ids).toContain('expo/no-env-var-destructuring');
  });
});
