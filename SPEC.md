# lipgloss-ts - Terminal Styling & Layout for TypeScript

## Overview
Port of Go's charmbracelet/lipgloss (https://github.com/charmbracelet/lipgloss) to TypeScript.
Declarative terminal styling with layout support - like CSS for the terminal.
Reference code at /tmp/lipgloss/

## Why
npm has chalk (colors) and boxen (boxes) but nothing like lipgloss that combines:
- Colors + bold/italic/underline
- Padding, margin, borders
- Width/height constraints
- Text alignment (left/center/right)
- Layout: horizontal join, vertical join
- Adaptive colors (light/dark terminal detection)

## Architecture
```
src/
  index.ts       - Public API
  style.ts       - Style class with chainable API (port set.go - 932 lines)
  render.ts      - Render styled text to ANSI strings
  color.ts       - Color handling (ANSI 256, true color, adaptive)
  border.ts      - Border styles (rounded, double, thick, etc.)
  layout.ts      - JoinHorizontal, JoinVertical, Place
  size.ts        - Width/height calculation
  types.ts       - TypeScript interfaces
  cli.ts         - Demo CLI
  mcp.ts         - MCP server
```

## API (match lipgloss's chainable style)
```typescript
import { NewStyle, JoinHorizontal, JoinVertical } from '@indiekit/lipgloss';

const style = NewStyle()
  .bold(true)
  .foreground('#FF6B6B')
  .background('#2D2D2D')
  .padding(1, 2)
  .border('rounded')
  .borderForeground('#888')
  .width(40)
  .align('center');

console.log(style.render('Hello World'));

// Layout
const left = styleA.render('Left panel');
const right = styleB.render('Right panel');
console.log(JoinHorizontal('top', left, right));
```

## Key Files in Reference
- /tmp/lipgloss/style.go - Style struct and methods
- /tmp/lipgloss/set.go - All setter methods (932 lines - THE core file)
- /tmp/lipgloss/get.go - Getter methods
- /tmp/lipgloss/render.go - Rendering logic
- /tmp/lipgloss/color.go - Color types
- /tmp/lipgloss/borders.go - Border definitions
- /tmp/lipgloss/join.go - Layout join functions
- /tmp/lipgloss/position.go - Alignment
- /tmp/lipgloss/size.go - Size calculation

## Scope - MVP
Focus on the most-used features:
- Style with colors, bold, italic, underline, strikethrough
- Padding and margin
- Borders (at least 4 styles: normal, rounded, double, thick)
- Width/height constraints
- Text alignment
- JoinHorizontal / JoinVertical
- True color + ANSI 256 + basic colors

Skip for now:
- Terminal detection (hasDarkBackground)
- Tab handling
- Complex Unicode width edge cases

## Package: @indiekit/lipgloss, ESM+CJS, vitest, tsup, zero deps
