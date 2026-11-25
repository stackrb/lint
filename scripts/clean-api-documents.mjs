import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

// mdaics asks the TypeScript checker for return types, which prints an internal
// node_modules path for Linter.Config. Collapse it to the public type name so
// the committed API reference stays readable and machine-independent.
const INTERNAL_CONFIG_TYPE = /Linter\.Config&lt;import\(&quot;\.\.\/(?:\.\.\/)?node\\?_modules\/@eslint\/core\/dist\/cjs\/types\.cjs&quot;\)\.RulesConfig&gt;\[\]/g;

/**
 * Normalises the generated Markdown files in one output directory.
 * @param {string} directory - Directory holding generated Markdown, including subdirectories.
 */
function clean(directory) {
  const entries = readdirSync(directory, { withFileTypes: true });
  for (const entry of entries) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      clean(filePath);
    } else if (entry.name.endsWith('.md')) {
      const source = readFileSync(filePath, 'utf8');
      const result = source.replaceAll(INTERNAL_CONFIG_TYPE, 'Linter.Config[]');
      if (result !== source) writeFileSync(filePath, result);
    }
  }
}

clean('docs/api');
