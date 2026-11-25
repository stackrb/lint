## Functions

<dl>
<dt><a href="#node">node()</a> ⇒ <code>Linter.Config[]</code></dt>
<dd><p>Builds Node.js globals for code files.</p>
</dd>
<dt><a href="#browser">browser()</a> ⇒ <code>Linter.Config[]</code></dt>
<dd><p>Builds browser globals and disables checks for Node-only builtins.</p>
</dd>
</dl>

<a name="node"></a>

## node() ⇒ <code>Linter.Config[]</code>
Builds Node.js globals for code files.

**Kind**: global function  
**Returns**: <code>Linter.Config[]</code> - The Node target config block.  
src: src/targets/runtime.ts:16  
<a name="browser"></a>

## browser() ⇒ <code>Linter.Config[]</code>
Builds browser globals and disables checks for Node-only builtins.

**Kind**: global function  
**Returns**: <code>Linter.Config[]</code> - The browser target config block.  
src: src/targets/runtime.ts:30  
