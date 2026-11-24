import { execFileSync } from 'node:child_process';
import type { ExecFileSyncOptionsWithStringEncoding } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const DIST_ENTRY = join(ROOT, 'dist', 'index.js');
const ESLINT_BIN = join(ROOT, 'node_modules', 'eslint', 'bin', 'eslint.js');
const EXAMPLE_CONFIG = join(ROOT, 'examples', 'consumer', 'eslint.config.mjs');

const created: string[] = [];

function project(): string {
  // Lowercase hex keeps the temporary directory name valid under unicorn/filename-case.
  const dir = join(tmpdir(), `stackrb-e2e-${randomBytes(6).toString('hex')}`);
  mkdirSync(dir, { recursive: true });
  created.push(dir);
  return dir;
}

function write(dir: string, relative: string, contents: string): void {
  const target = join(dir, relative);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, contents, 'utf8');
}

function writeConfig(dir: string): void {
  write(
    dir,
    'eslint.config.mjs',
    [
      `import config from ${JSON.stringify(pathToFileURL(DIST_ENTRY).href)};`,
      '// eslint-disable-next-line unicorn/prefer-export-from -- the preset is re-exported unchanged',
      'export default config;',
      '',
    ].join('\n'),
  );
}

interface Result {
  readonly status: number;
  readonly output: string;
}

function runEslint(cwd: string): Result {
  const args = [ESLINT_BIN, '.', '--no-error-on-unmatched-pattern'];
  const options: ExecFileSyncOptionsWithStringEncoding = {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  };

  try {
    return { status: 0, output: execFileSync(process.execPath, args, options) };
  } catch (cause: unknown) {
    if (typeof cause === 'object' && cause !== null && 'status' in cause && 'stdout' in cause) {
      const failure = cause as { status: number | null; stdout: string; stderr?: string };
      return {
        status: failure.status ?? 1,
        output: `${String(failure.stdout)}${failure.stderr === undefined ? '' : String(failure.stderr)}`,
      };
    }
    throw cause;
  }
}

afterEach(() => {
  for (const dir of created.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe('drop-in CLI experience', () => {
  it('passes a clean project', () => {
    const dir = project();
    writeConfig(dir);
    write(dir, 'index.js', 'export const value = 1;\n');
    write(dir, 'sample.ts', 'export const greet = (name: string): string => `Hello, ${name}`;\n');

    const result = runEslint(dir);

    expect(result.status).toBe(0);
    expect(result.output).toBe('');
  });

  it('fails a bad project with the expected rule ids', () => {
    const dir = project();
    writeConfig(dir);
    write(dir, 'index.js', 'const unused = 1;\ndebugger;\n');

    const result = runEslint(dir);

    expect(result.status).toBe(1);
    expect(result.output).toContain('no-unused-vars');
    expect(result.output).toContain('no-debugger');
  });

  it('skips ignored directories', () => {
    const dir = project();
    writeConfig(dir);
    write(dir, 'index.js', 'export const value = 1;\n');
    write(dir, 'dist/generated.js', 'const unused = 1;\n');

    const result = runEslint(dir);

    expect(result.status).toBe(0);
    expect(result.output).not.toContain('generated.js');
    expect(result.output).not.toContain('no-unused-vars');
  });

  it('parses TypeScript and reports TypeScript rules', () => {
    const dir = project();
    writeConfig(dir);
    write(dir, 'sample.ts', 'export const value: any = 1;\n');

    const result = runEslint(dir);

    expect(result.status).toBe(1);
    expect(result.output).toContain('@typescript-eslint/no-explicit-any');
    expect(result.output).not.toContain('Parsing error');
  });

  it('loads the checked-in consumer example config shape', () => {
    const source = readFileSync(EXAMPLE_CONFIG, 'utf8');
    expect(source).toContain("import config from '@stackrb/eslint-config';");
    expect(source).toContain('export default config;');

    const dir = project();
    const configUrl = pathToFileURL(join(dir, 'eslint.config.mjs')).href;
    write(dir, 'eslint.config.mjs', source.replace('@stackrb/eslint-config', pathToFileURL(DIST_ENTRY).href));

    const script = [
      `const config = (await import(${JSON.stringify(configUrl)})).default;`,
      'if (!Array.isArray(config) || config.length === 0) process.exitCode = 1;',
    ].join('\n');

    expect(() =>
      execFileSync(process.execPath, ['--input-type=module', '-e', script], {
        cwd: dir,
        encoding: 'utf8',
      }),
    ).not.toThrow();
  });
});
