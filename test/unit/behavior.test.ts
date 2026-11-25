import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';
import { createConfig, type Options } from '../../src/index.js';
import { messageRuleIds } from '../shared/helpers.js';

interface DiagnosticCase {
  readonly label: string;
  readonly source: string;
  readonly filePath: string;
  readonly ruleId: string;
  readonly options?: Options;
}

const CASES: readonly DiagnosticCase[] = [
  {
    label: 'reports a sonarjs diagnostic',
    source: 'const value = eval(input);\nexport { value };\n',
    filePath: 'sonar.js',
    ruleId: 'sonarjs/code-eval',
  },
  {
    label: 'reports a security diagnostic',
    source: 'const value = eval(input);\nexport { value };\n',
    filePath: 'security.js',
    ruleId: 'security/detect-eval-with-expression',
  },
  {
    label: 'reports a regexp diagnostic',
    source: 'const re = /a{1,}/;\nexport { re };\n',
    filePath: 'regexp.js',
    ruleId: 'regexp/prefer-plus-quantifier',
  },
  {
    label: 'reports a promise diagnostic',
    source: 'p.then(() => { console.log("x") });\n',
    filePath: 'promise.js',
    ruleId: 'promise/always-return',
  },
  {
    label: 'reports a unicorn diagnostic',
    source: 'throw new Error();\n',
    filePath: 'unicorn.js',
    ruleId: 'unicorn/error-message',
  },
  {
    label: 'reports a jsdoc diagnostic in JavaScript',
    source: '/** @param {string} bar */\nfunction f(foo) { return foo }\n',
    filePath: 'jsdoc-js.js',
    ruleId: 'jsdoc/check-param-names',
  },
  {
    label: 'reports a jsdoc diagnostic in TypeScript',
    source: '/** @param {string} bar */\nfunction f(foo: string): string { return foo }\n',
    filePath: 'jsdoc-ts.ts',
    ruleId: 'jsdoc/check-param-names',
  },
  {
    label: 'reports a typescript-eslint diagnostic',
    source: 'const x: any = 1;\nexport { x };\n',
    filePath: 'typescript.ts',
    ruleId: '@typescript-eslint/no-explicit-any',
  },
  {
    label: 'reports a json diagnostic',
    source: '{"a":1,"a":2}\n',
    filePath: 'data.json',
    ruleId: 'json/no-duplicate-keys',
  },
  {
    label: 'reports a markdown diagnostic',
    source: '# Title\n\n![](image.png)\n',
    filePath: 'readme.md',
    ruleId: 'markdown/require-alt-text',
  },
  {
    label: 'reports a Playwright diagnostic',
    source: 'test("x", async ({ page }) => { await page.waitForTimeout(1000); expect(1).toBe(1); });\n',
    filePath: 'playwright.spec.ts',
    ruleId: 'playwright/no-wait-for-timeout',
  },
  {
    label: 'reports a shell diagnostic',
    source: 'echo `pwd`\n',
    filePath: 'script.sh',
    ruleId: 'shell/no-backticks',
  },
  {
    label: 'reports a vitest diagnostic in a test file',
    source: 'it("does nothing", () => {});\n',
    filePath: 'sample.test.js',
    ruleId: 'vitest/expect-expect',
  },
  {
    label: 'reports a React diagnostic',
    source: 'const Bad = () => <div dangerouslySetInnerHTML={{ __html: "x" }} />;\nexport default Bad;\n',
    filePath: 'component.jsx',
    ruleId: '@eslint-react/dom-no-dangerously-set-innerhtml',
    options: { target: 'react' },
  },
  {
    label: 'reports an Expo diagnostic',
    source: 'const { API_URL } = process.env;\nconsole.log(API_URL);\n',
    filePath: 'app.js',
    ruleId: 'expo/no-env-var-destructuring',
    options: { target: 'expo' },
  },
];

async function ruleIds(text: string, filePath: string, options?: Options): Promise<string[]> {
  const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: createConfig(options) });
  const [result] = await eslint.lintText(text, { filePath });

  return result === undefined ? [] : messageRuleIds(result.messages);
}

describe('linting behavior', () => {
  it.each(CASES)('$label', async ({ source, filePath, ruleId, options }) => {
    const ids = await ruleIds(source, filePath, options);

    expect(ids).toContain(ruleId);
  });
});
