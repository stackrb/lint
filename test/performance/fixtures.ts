import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export interface Corpus {
  readonly dir: string;
  readonly files: readonly string[];
  readonly largeFilePath: string;
  readonly largeSource: string;
}

type Rng = () => number;
type BlockBuilder = (id: number, rng: Rng) => string;

const FILE_COUNT = 120;

function makeRng(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)] ?? items[0]!;
}

function importsBlock(id: number, rng: Rng): string {
  const sources = ['node:fs', 'node:path', 'node:url', './types.js', './helpers.js', 'react'];
  const count = 2 + Math.floor(rng() * 3);
  const lines: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const source = pick(rng, sources);
    lines.push(rng() < 0.5
      ? `import * as ns${id}_${i} from '${source}';`
      : `import { value${id}_${i} as local${id}_${i} } from '${source}';`);
  }
  return lines.join('\n');
}

function typesBlock(id: number, rng: Rng): string {
  const fields = ['label', 'count', 'enabled', 'tags', 'meta'];
  const count = 2 + Math.floor(rng() * 4);
  const props: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const type = pick(rng, ['string', 'number', 'boolean', 'readonly string[]', 'Record<string, number>']);
    props.push(`  ${fields[i]}: ${type};`);
  }
  return [
    `export interface Item${id} {\n${props.join('\n')}\n}`,
    `export type Result${id} = { ok: true; value: Item${id} } | { ok: false; error: Error };`,
  ].join('\n\n');
}

function functionBlock(id: number, rng: Rng): string {
  const limit = 3 + Math.floor(rng() * 12);
  const operator = pick(rng, ['+=', '-=', '*=']);
  return [
    `export function compute${id}(values: readonly number[], factor = ${1 + Math.floor(rng() * 5)}): number {`,
    '  let total = 0;',
    `  for (let index = 0; index < ${limit}; index += 1) {`,
    '    const value = values[index % Math.max(values.length, 1)] ?? 0;',
    `    if (value > factor) { total ${operator} value; } else { total += factor; }`,
    '  }',
    '  return total;',
    '}',
  ].join('\n');
}

function asyncBlock(id: number, rng: Rng): string {
  return [
    `export async function fetch${id}(url: string): Promise<string> {`,
    '  try {',
    '    const response = await Promise.resolve(url);',
    `    if (response.length < ${1 + Math.floor(rng() * 4)}) throw new Error('empty response');`,
    '    return response;',
    '  } catch (error) {',
    "    return error instanceof Error ? error.message : 'unknown';",
    '  } finally {',
    '    await Promise.resolve();',
    '  }',
    '}',
  ].join('\n');
}

function classBlock(id: number, rng: Rng): string {
  return [
    `export class Service${id}<T extends { id: string }> {`,
    '  private readonly cache = new Map<string, T>();',
    '  constructor(private readonly base: string) {}',
    '  add(item: T): void { this.cache.set(item.id, item); }',
    '  get(key: string): T | undefined { return this.cache.get(key); }',
    '  async load(ids: readonly string[]): Promise<T[]> {',
    `    const limit = ${1 + Math.floor(rng() * 5)};`,
    '    const picked = ids.slice(0, limit).map((key) => this.cache.get(key));',
    '    return Promise.all(picked.filter((item): item is T => item !== undefined));',
    '  }',
    '}',
  ].join('\n');
}

function arrowBlock(id: number, rng: Rng): string {
  return [
    `export const transform${id} = (items: readonly number[]) => items.map((item, index) => item * (index + ${1 + Math.floor(rng() * 4)}));`,
    `export const predicate${id} = (item: number): boolean => item % ${2 + Math.floor(rng() * 5)} === 0;`,
    `export const pipeline${id} = (...fns: readonly ((value: number) => number)[]) => (value: number) => fns.reduce((acc, fn) => fn(acc), value);`,
  ].join('\n');
}

function constantsBlock(id: number, rng: Rng): string {
  return [
    `export const LIMIT_${id} = ${5 + Math.floor(rng() * 90)};`,
    `export const FLAGS_${id} = { alpha: true, beta: false, gamma: ${rng() < 0.5} } as const;`,
    `export const NAMES_${id} = ['alpha', 'beta', 'gamma'] as const;`,
  ].join('\n');
}

function jsxBlock(id: number, rng: Rng): string {
  return [
    `interface Card${id}Props {`,
    '  title: string;',
    '  items?: readonly string[];',
    '}',
    '',
    `export function Card${id}({ title, items = [] }: Card${id}Props) {`,
    '  return (',
    `    <section className="card" data-id="${id}">`,
    '      <h2>{title}</h2>',
    '      <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>',
    `      <button type="button" onClick={() => undefined}>${pick(rng, ['Save', 'Cancel', 'Continue', 'Delete'])}</button>`,
    '    </section>',
    '  );',
    '}',
  ].join('\n');
}

const BLOCKS: readonly BlockBuilder[] = [typesBlock, functionBlock, asyncBlock, classBlock, arrowBlock, constantsBlock];
const BASE_NAMES = ['index', 'utils', 'service', 'model', 'controller', 'helper', 'types', 'client', 'parser', 'renderer', 'store', 'adapter', 'middleware', 'handler', 'config', 'logger', 'cache', 'worker', 'router', 'schema'] as const;
const DIRS = ['src', 'src/utils', 'src/services', 'src/components', 'test'] as const;

function buildFile(index: number, rng: Rng, isTsx: boolean): string {
  const blocks: string[] = [importsBlock(index, rng)];
  const count = 4 + Math.floor(rng() * 4);
  for (let i = 0; i < count; i += 1) {
    blocks.push(pick(rng, BLOCKS)(index * 10 + i, rng));
  }
  if (isTsx) {
    blocks.push(jsxBlock(index * 10 + 9, rng));
  }
  return `${blocks.join('\n\n')}\n`;
}

function generateCorpus(): Corpus {
  const dir = mkdtempSync(join(tmpdir(), 'stackrb-eslint-bench-'));
  const rng = makeRng(0x51ab_c0de);
  const files: string[] = [];

  for (let index = 0; index < FILE_COUNT; index += 1) {
    const isTsx = index % 4 === 0;
    const subDir = DIRS[index % DIRS.length] ?? 'src';
    mkdirSync(join(dir, subDir), { recursive: true });
    const name = `${BASE_NAMES[index % BASE_NAMES.length]}-${index}.${isTsx ? 'tsx' : 'ts'}`;
    const filePath = join(dir, subDir, name);
    writeFileSync(filePath, buildFile(index, rng, isTsx), 'utf8');
    files.push(filePath);
  }

  const largeSourceParts: string[] = [importsBlock(90000, rng)];
  for (let i = 0; i < 140; i += 1) {
    largeSourceParts.push(pick(rng, BLOCKS)(91000 + i, rng));
  }
  const largeSource = `${largeSourceParts.join('\n\n')}\n`;
  const largeFilePath = join(dir, 'src', 'large-file.ts');
  mkdirSync(join(dir, 'src'), { recursive: true });
  writeFileSync(largeFilePath, largeSource, 'utf8');

  return { dir, files: files.sort(), largeFilePath, largeSource };
}

let cached: Corpus | undefined;

export function getCorpus(): Corpus {
  if (cached === undefined) {
    cached = generateCorpus();
    // A benchmark worker may not run regular test hooks, so guard cleanup here too.
    process.once('beforeExit', () => {
      cleanupCorpus();
    });
  }
  return cached;
}

export function cleanupCorpus(): void {
  if (cached !== undefined) {
    rmSync(cached.dir, { recursive: true, force: true });
    cached = undefined;
  }
}
