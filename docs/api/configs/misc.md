## Functions

<dl>
<dt><a href="#ignores">ignores(extra)</a> ⇒ <code>Linter.Config[]</code></dt>
<dd><p>Builds the global-ignores block from the default patterns plus extras.</p>
</dd>
<dt><a href="#prettier">prettier()</a> ⇒ <code>Linter.Config[]</code></dt>
<dd><p>Builds the final compatibility config that disables stylistic rule conflicts.</p>
</dd>
<dt><a href="#tests">tests()</a> ⇒ <code>Linter.Config[]</code></dt>
<dd><p>Builds Vitest rules and globals for test files.</p>
</dd>
</dl>

<a name="ignores"></a>

## ignores(extra) ⇒ <code>Linter.Config[]</code>
Builds the global-ignores block from the default patterns plus extras.

**Kind**: global function  
**Returns**: <code>Linter.Config[]</code> - The named global-ignores block.  

| Param | Type | Description |
| --- | --- | --- |
| extra | <code>readonly string[]</code> | Additional glob patterns to ignore. |

src: src/configs/misc.ts:14  
<a name="prettier"></a>

## prettier() ⇒ <code>Linter.Config[]</code>
Builds the final compatibility config that disables stylistic rule conflicts.

**Kind**: global function  
**Returns**: <code>Linter.Config[]</code> - The Prettier compatibility block.  
src: src/configs/misc.ts:22  
<a name="tests"></a>

## tests() ⇒ <code>Linter.Config[]</code>
Builds Vitest rules and globals for test files.

**Kind**: global function  
**Returns**: <code>Linter.Config[]</code> - The test-file config blocks.  
src: src/configs/misc.ts:33  
