## Functions

<dl>
<dt><a href="#javascript">javascript()</a> ⇒ <code>Linter.Config&lt;import(&quot;../../node_modules/@eslint/core/dist/cjs/types.cjs&quot;).RulesConfig&gt;[]</code></dt>
<dd><p>Builds JSDoc rules for JavaScript files.</p>
</dd>
<dt><a href="#typescript">typescript(options)</a> ⇒ <code>Linter.Config&lt;import(&quot;../../node_modules/@eslint/core/dist/cjs/types.cjs&quot;).RulesConfig&gt;[]</code></dt>
<dd><p>Builds TypeScript rules, optionally with type-aware checks.</p>
</dd>
<dt><a href="#data">data(options)</a> ⇒ <code>Linter.Config&lt;import(&quot;../../node_modules/@eslint/core/dist/cjs/types.cjs&quot;).RulesConfig&gt;[]</code></dt>
<dd><p>Builds the JSON, JSONC and JSON5 language configs.</p>
</dd>
<dt><a href="#markdown">markdown()</a> ⇒ <code>Linter.Config&lt;import(&quot;../../node_modules/@eslint/core/dist/cjs/types.cjs&quot;).RulesConfig&gt;[]</code></dt>
<dd><p>Builds the GFM Markdown config.</p>
</dd>
</dl>

<a name="javascript"></a>

## javascript() ⇒ <code>Linter.Config&lt;import(&quot;../../node\_modules/@eslint/core/dist/cjs/types.cjs&quot;).RulesConfig&gt;[]</code>
Builds JSDoc rules for JavaScript files.

**Kind**: global function  
**Returns**: <code>Linter.Config&lt;import(&quot;../../node\_modules/@eslint/core/dist/cjs/types.cjs&quot;).RulesConfig&gt;[]</code> - The JavaScript config blocks.  
src: src/configs/languages.ts:19  
dist: dist/configs/languages.js:13
<a name="typescript"></a>

## typescript(options) ⇒ <code>Linter.Config&lt;import(&quot;../../node\_modules/@eslint/core/dist/cjs/types.cjs&quot;).RulesConfig&gt;[]</code>
Builds TypeScript rules, optionally with type-aware checks.

**Kind**: global function  
**Returns**: <code>Linter.Config&lt;import(&quot;../../node\_modules/@eslint/core/dist/cjs/types.cjs&quot;).RulesConfig&gt;[]</code> - The TypeScript config blocks.  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Options</code> | Set `typed` to enable `parserOptions.projectService`. |

src: src/configs/languages.ts:32  
dist: dist/configs/languages.js:25
<a name="data"></a>

## data(options) ⇒ <code>Linter.Config&lt;import(&quot;../../node\_modules/@eslint/core/dist/cjs/types.cjs&quot;).RulesConfig&gt;[]</code>
Builds the JSON, JSONC and JSON5 language configs.

**Kind**: global function  
**Returns**: <code>Linter.Config&lt;import(&quot;../../node\_modules/@eslint/core/dist/cjs/types.cjs&quot;).RulesConfig&gt;[]</code> - The data-file config blocks.  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Options</code> | Banned dependencies are enforced on `.json` files only. |

src: src/configs/languages.ts:56  
dist: dist/configs/languages.js:47
<a name="markdown"></a>

## markdown() ⇒ <code>Linter.Config&lt;import(&quot;../../node\_modules/@eslint/core/dist/cjs/types.cjs&quot;).RulesConfig&gt;[]</code>
Builds the GFM Markdown config.

**Kind**: global function  
**Returns**: <code>Linter.Config&lt;import(&quot;../../node\_modules/@eslint/core/dist/cjs/types.cjs&quot;).RulesConfig&gt;[]</code> - The Markdown config blocks.  
src: src/configs/languages.ts:79  
dist: dist/configs/languages.js:65
