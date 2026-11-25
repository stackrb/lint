## Functions

<dl>
<dt><a href="#node">node()</a> ⇒ <code>Linter.Config&lt;import(&quot;../../node_modules/@eslint/core/dist/cjs/types.cjs&quot;).RulesConfig&gt;[]</code></dt>
<dd><p>Builds Node.js globals for code files.</p>
</dd>
<dt><a href="#browser">browser()</a> ⇒ <code>Linter.Config&lt;import(&quot;../../node_modules/@eslint/core/dist/cjs/types.cjs&quot;).RulesConfig&gt;[]</code></dt>
<dd><p>Builds browser globals and disables checks for Node-only builtins.</p>
</dd>
</dl>

<a name="node"></a>

## node() ⇒ <code>Linter.Config&lt;import(&quot;../../node\_modules/@eslint/core/dist/cjs/types.cjs&quot;).RulesConfig&gt;[]</code>
Builds Node.js globals for code files.

**Kind**: global function  
**Returns**: <code>Linter.Config&lt;import(&quot;../../node\_modules/@eslint/core/dist/cjs/types.cjs&quot;).RulesConfig&gt;[]</code> - The Node target config block.  
src: src/targets/runtime.ts:16  
dist: dist/targets/runtime.js:11
<a name="browser"></a>

## browser() ⇒ <code>Linter.Config&lt;import(&quot;../../node\_modules/@eslint/core/dist/cjs/types.cjs&quot;).RulesConfig&gt;[]</code>
Builds browser globals and disables checks for Node-only builtins.

**Kind**: global function  
**Returns**: <code>Linter.Config&lt;import(&quot;../../node\_modules/@eslint/core/dist/cjs/types.cjs&quot;).RulesConfig&gt;[]</code> - The browser target config block.  
src: src/targets/runtime.ts:30  
dist: dist/targets/runtime.js:24
