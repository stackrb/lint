import type { Linter } from 'eslint';

export type DeprecationKind = 'function' | 'import' | 'member-expression';

export interface DeprecationRule {
  readonly kind?: DeprecationKind;
  readonly name: string;
  readonly use?: string;
}

export type GlobalValue = 'off' | 'readonly' | 'writable' | boolean;

export interface Options {
  /**
  Dependency names or patterns that `eslint-plugin-depend` should ban.
  */
  readonly bannedDependencies?: readonly string[];
  /**
  Deprecated symbols that `eslint-plugin-deprecate` should report.
  */
  readonly deprecations?: readonly DeprecationRule[];
  /**
  Additional ambient globals (for example `chrome`, `GM_xmlhttpRequest`).
  */
  readonly extraGlobals?: Readonly<Record<string, GlobalValue>>;
  /**
  Extra patterns added to the global ignore list.
  */
  readonly extraIgnores?: readonly string[];
  /**
  Final rule overrides, applied after every preset including Prettier.
  */
  readonly extraRules?: Linter.RulesRecord;
  /**
  Value for `settings.node.version`; prevents guessing from the consumer's `engines`.
  */
  readonly nodeVersion?: string;
  /**
  Runtime(s) the consuming package targets. Defaults to `node`.
  */
  readonly target?: readonly Target[] | Target;
  /**
  Enable type-aware rules via `parserOptions.projectService`.
  */
  readonly typed?: boolean;
}

export type Target = 'browser' | 'expo' | 'native' | 'node' | 'react';
