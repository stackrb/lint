import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ESLint } from 'eslint';
import type { Linter } from 'eslint';
import { clearCandidateTSConfigRootDirs } from '@typescript-eslint/typescript-estree';
import type { Options } from '../../src/types.js';
import { messageRuleIds } from '../shared/helpers.js';

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CONFIG_MODULE_URL = pathToFileURL(join(PACKAGE_ROOT, 'dist', 'index.js')).href;

export interface CreateProjectOptions {
  /** Options passed to `createConfig` by the generated `eslint.config.mjs`. */
  readonly configOptions?: Options;
  /** Replace the generated config file entirely (must still export a flat config). */
  readonly configSource?: string;
  /** Extra files written before linting; nested paths are created automatically. */
  readonly files?: Readonly<Record<string, string>>;
}

export interface Project {
  readonly dir: string;
  write(relativePath: string, content: string): Promise<string>;
  lint(patterns?: readonly string[]): Promise<ESLint.LintResult[]>;
  isIgnored(relativePath: string): Promise<boolean>;
  configFor(relativePath: string): Promise<Linter.Config>;
  cleanup(): Promise<void>;
}

function generatedConfig(options: Options): string {
  // The built artifact is imported by absolute URL so the temp project needs no node_modules.
  return `import { createConfig } from ${JSON.stringify(CONFIG_MODULE_URL)};\nexport default createConfig(${JSON.stringify(options)});\n`;
}

export async function createProject(options: CreateProjectOptions = {}): Promise<Project> {
  // Evaluating a config file registers a global tsconfig-root candidate; keep
  // separate fixture projects from seeing each other's candidates.
  clearCandidateTSConfigRootDirs();
  const dir = await mkdtemp(join(tmpdir(), 'stackrb-eslint-'));

  const write = async (relativePath: string, content: string): Promise<string> => {
    const absolutePath = join(dir, relativePath);
    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, content, 'utf8');
    return absolutePath;
  };

  await write(
    'package.json',
    `${JSON.stringify({ name: 'fixture-project', private: true, version: '0.0.0', type: 'module' }, null, 2)}\n`,
  );
  await write(
    'tsconfig.json',
    `${JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          strict: true,
        },
        include: ['src/**/*.ts', 'src/**/*.tsx'],
      },
      null,
      2,
    )}\n`,
  );
  await write('eslint.config.mjs', options.configSource ?? generatedConfig(options.configOptions ?? {}));

  for (const [relativePath, content] of Object.entries(options.files ?? {})) {
    await write(relativePath, content);
  }

  // No overrideConfigFile: ESLint must discover eslint.config.mjs from the temp cwd.
  const makeEslint = (): ESLint => new ESLint({ cwd: dir });

  return {
    dir,
    write,
    lint(patterns = ['.']) {
      return makeEslint().lintFiles([...patterns]);
    },
    isIgnored(relativePath) {
      return makeEslint().isPathIgnored(join(dir, relativePath));
    },
    configFor(relativePath) {
      return makeEslint().calculateConfigForFile(join(dir, relativePath)) as Promise<Linter.Config>;
    },
    cleanup() {
      return rm(dir, { recursive: true, force: true });
    },
  };
}

export async function withProject<T>(
  options: CreateProjectOptions,
  fn: (project: Project) => Promise<T>,
): Promise<T> {
  const project = await createProject(options);
  try {
    return await fn(project);
  } finally {
    await project.cleanup();
  }
}

export function ruleIds(results: readonly ESLint.LintResult[]): string[] {
  return results.flatMap((result) => messageRuleIds(result.messages));
}
