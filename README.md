[English](README.md) | [中文](README.zh-CN.md)

# @indiekit/lipgloss

[![npm version](https://img.shields.io/npm/v/@indiekit/lipgloss)](https://www.npmjs.com/package/@indiekit/lipgloss)
[![license](https://img.shields.io/npm/l/@indiekit/lipgloss)](./LICENSE)
[![tests](https://img.shields.io/badge/tests-83%20passed-brightgreen)](#)

Terminal styling & layout for TypeScript — a port of [charmbracelet/lipgloss](https://github.com/charmbracelet/lipgloss).

**Zero dependencies. Immutable API. Layout support. True Color.**

## Features

```
╭──────────────────────────────────╮
│                                  │
│   ✅ Chainable, immutable API    │
│   🎨 True Color + ANSI 256      │
│   📦 Zero runtime dependencies   │
│   📐 Horizontal & vertical join  │
│   🔲 7 border styles             │
│   📏 Width/height constraints    │
│   🀄 CJK & emoji width support   │
│   🤖 MCP server built-in         │
│                                  │
╰──────────────────────────────────╯
```

### Border Styles

```
┌────────┐  ╭────────╮  ╔════════╗  ┏━━━━━━━━┓
│ normal │  │rounded │  ║ double ║  ┃ thick  ┃
└────────┘  ╰────────╯  ╚════════╝  ┗━━━━━━━━┛

+--------+  ████████████
| ascii  |  █  block   █
+--------+  ████████████
```

### Color Support

```ts
// Hex colors (3 or 6 digit)
style.foreground('#FF6B6B')
style.background('#2D2D2D')

// ANSI 256 index
style.foreground(196)    // bright red
style.background(236)    // dark gray

// RGB object
style.foreground({ r: 255, g: 107, b: 107 })
```

### Layout

```
╭────────────╮╭────────────╮
│            ││            │    ← JoinHorizontal(Top, a, b)
│   Left     ││   Right    │
│            ││            │
╰────────────╯╰────────────╯

┌──────────────────────────┐
│       Top Section        │    ← JoinVertical(Left, a, b)
├──────────────────────────┤
│     Bottom Section       │
└──────────────────────────┘
```

## Install

```bash
npm install @indiekit/lipgloss
```

## Quick Start

```ts
import { NewStyle, JoinHorizontal, Top, Center } from '@indiekit/lipgloss';

// Create a styled box
const style = NewStyle()
  .bold()
  .foreground('#FAFAFA')
  .background('#874BFD')
  .border('rounded')
  .borderForeground('#FF6B6B')
  .padding(1, 3)
  .width(40)
  .align(Center);

console.log(style.render('Hello, lipgloss! 🎨'));

// Layout: join two panels side by side
const left = NewStyle().border('rounded').padding(1, 2).render('Panel A');
const right = NewStyle().border('rounded').padding(1, 2).render('Panel B');
console.log(JoinHorizontal(Top, left, right));
```

## API

### `NewStyle(): Style`

Create a new empty `Style`. Every method returns a **new** Style (immutable).

### Style Methods

#### Text Attributes

| Method | Description |
|--------|-------------|
| `.bold(v?)` | Bold text |
| `.italic(v?)` | Italic text |
| `.underline(v?)` | Underlined text |
| `.strikethrough(v?)` | Strikethrough text |
| `.faint(v?)` | Faint/dim text |
| `.blink(v?)` | Blinking text |
| `.reverse(v?)` | Swap fg/bg colors |

All accept an optional boolean (default `true`).

#### Colors

| Method | Description |
|--------|-------------|
| `.foreground(color)` | Set text color |
| `.background(color)` | Set background color |

`ColorValue` = `string` (hex) \| `number` (ANSI 0-255) \| `{ r, g, b }` \| `null`

#### Dimensions

| Method | Description |
|--------|-------------|
| `.width(n)` | Fixed width (content wraps) |
| `.height(n)` | Fixed height (content aligns) |
| `.maxWidth(n)` | Maximum width (truncates) |
| `.maxHeight(n)` | Maximum height (truncates) |

#### Alignment

| Method | Description |
|--------|-------------|
| `.align(h, v?)` | Set horizontal (and optionally vertical) alignment |
| `.alignHorizontal(pos)` | `Left` (0), `Center` (0.5), `Right` (1) |
| `.alignVertical(pos)` | `Top` (0), `Center` (0.5), `Bottom` (1) |

#### Padding & Margin

CSS shorthand — 1 to 4 values: `(all)`, `(v, h)`, `(top, h, bottom)`, `(top, right, bottom, left)`.

| Method | Description |
|--------|-------------|
| `.padding(...n)` | Inner spacing |
| `.paddingTop/Right/Bottom/Left(n)` | Individual sides |
| `.margin(...n)` | Outer spacing |
| `.marginTop/Right/Bottom/Left(n)` | Individual sides |
| `.marginBackground(color)` | Color the margin area |

#### Borders

| Method | Description |
|--------|-------------|
| `.border(style, ...sides?)` | Set border style + optional sides (CSS shorthand booleans) |
| `.borderStyle(style)` | Set border style only |
| `.borderTop/Right/Bottom/Left(bool)` | Toggle individual sides |
| `.borderForeground(...colors)` | Border color (1-4 values, CSS shorthand) |
| `.borderBackground(...colors)` | Border background (1-4 values) |

Border styles: `'normal'`, `'rounded'`, `'double'`, `'thick'`, `'hidden'`, `'block'`, `'ascii'`, `'none'`

Or use pre-built objects: `NormalBorder`, `RoundedBorder`, `DoubleBorder`, `ThickBorder`, `HiddenBorder`, `BlockBorder`, `ASCIIBorder`, `NoBorder`.

#### Other

| Method | Description |
|--------|-------------|
| `.inline(v?)` | Strip newlines |
| `.tabWidth(n)` | Tab stop width (-1 to keep tabs) |
| `.colorWhitespace(v)` | Apply bg color to padding spaces |
| `.transform(fn)` | Apply text transform before styling |
| `.setValue(str)` | Store a default value |

#### Rendering

| Method | Description |
|--------|-------------|
| `.render(...strs)` | Render styled output |
| `.toString()` | Same as `.render()` |

#### Getters

Every setter has a corresponding getter: `getBold()`, `getWidth()`, `getPaddingTop()`, `getHorizontalFrameSize()`, `getFrameSize()`, etc.

### Layout Functions

```ts
import { JoinHorizontal, JoinVertical, Place, PlaceHorizontal, PlaceVertical } from '@indiekit/lipgloss';
```

| Function | Description |
|----------|-------------|
| `JoinHorizontal(pos, ...strs)` | Join blocks side by side. `pos`: vertical alignment (Top/Center/Bottom) |
| `JoinVertical(pos, ...strs)` | Stack blocks vertically. `pos`: horizontal alignment (Left/Center/Right) |
| `Place(w, h, hPos, vPos, str)` | Place string in a w×h box |
| `PlaceHorizontal(w, pos, str)` | Place string in a fixed-width space |
| `PlaceVertical(h, pos, str)` | Place string in a fixed-height space |

### Measurement

```ts
import { Width, Height, StringWidth } from '@indiekit/lipgloss';

Width('hello\nworld!');   // 6 (max line width)
Height('hello\nworld!');  // 2 (number of lines)
StringWidth('你好');       // 4 (CJK = 2 cells each)
```

### Position Constants

| Constant | Value | Usage |
|----------|-------|-------|
| `Top` / `Left` | `0` | Start |
| `Center` | `0.5` | Middle |
| `Bottom` / `Right` | `1` | End |

Any float `0..1` works as a position.

## CLI

```bash
# Visual demo
npx @indiekit/lipgloss

# Machine-readable output (for agents/scripts)
npx @indiekit/lipgloss --json
```

Exit codes: `0` = success, `1` = error.

## MCP Server

lipgloss includes a built-in [Model Context Protocol](https://modelcontextprotocol.io) server for AI agent integration.

### Setup

Add to your MCP client config:

```json
{
  "mcpServers": {
    "lipgloss": {
      "command": "node",
      "args": ["node_modules/@indiekit/lipgloss/dist/mcp.js"]
    }
  }
}
```

### Tools

| Tool | Description |
|------|-------------|
| `style_render` | Render styled text with colors, borders, padding, alignment |
| `join_horizontal` | Join text blocks side by side |
| `join_vertical` | Stack text blocks vertically |
| `measure` | Get width and height of a text block |

### Example

```json
{
  "name": "style_render",
  "arguments": {
    "text": "Hello from MCP!",
    "bold": true,
    "foreground": "#FF6B6B",
    "border": "rounded",
    "padding": [1, 3]
  }
}
```

## Comparison

### vs Go lipgloss

| | Go lipgloss | @indiekit/lipgloss |
|---|---|---|
| Language | Go | TypeScript/JavaScript |
| API style | Chainable, immutable | Chainable, immutable |
| Colors | Adaptive (term profile) | True Color + ANSI 256 |
| Borders | ✅ | ✅ All 7 styles |
| Layout | ✅ JoinH/V, Place | ✅ JoinH/V, Place |
| Padding/Margin | ✅ | ✅ CSS shorthand |
| MCP server | ❌ | ✅ Built-in |
| Dependencies | Go stdlib | **Zero** |

### vs chalk

| | chalk | @indiekit/lipgloss |
|---|---|---|
| Colors | ✅ | ✅ |
| Bold/italic/etc | ✅ | ✅ |
| Borders | ❌ | ✅ 7 styles |
| Padding/Margin | ❌ | ✅ |
| Width/Height | ❌ | ✅ |
| Alignment | ❌ | ✅ |
| Layout (join) | ❌ | ✅ |
| Immutable | ❌ (mutable chain) | ✅ |
| Dependencies | 0 (v5) | **0** |

## Why lipgloss-ts?

- **Zero dependencies** — nothing to audit, nothing to break
- **Immutable API** — styles are values, safe to share and compose
- **Layout primitives** — `JoinHorizontal`, `JoinVertical`, `Place` for real TUI layouts
- **Full box model** — padding, margin, borders, alignment, width/height constraints
- **CJK & emoji aware** — correct width calculation for all characters
- **Agent-friendly** — MCP server + `--json` CLI flag for machine consumption

## License

MIT
