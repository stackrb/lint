## Constants

<dl>
<dt><a href="#plugin">plugin</a></dt>
<dd><p>Plugin-shaped facade exposing lazily built, cached presets for <code>extends</code>.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#createConfig">createConfig(options)</a> ⇒ <code>Linter.Config[]</code></dt>
<dd><p>Builds the complete ESLint flat config in the documented composition order.</p>
</dd>
</dl>

<a name="plugin"></a>

## plugin
Plugin-shaped facade exposing lazily built, cached presets for `extends`.

**Kind**: global constant  
src: src/index.ts:102  
dist: dist/index.js:88
<a name="createConfig"></a>

## createConfig(options) ⇒ <code>Linter.Config[]</code>
Builds the complete ESLint flat config in the documented composition order.

**Kind**: global function  
**Returns**: <code>Linter.Config[]</code> - The ordered config blocks consumed by ESLint.  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Options</code> | Targets, ignores, globals, rules and other customisations. |

src: src/index.ts:56  
dist: dist/index.js:47
