#!/usr/bin/env node
/**
 * @indiekit/lipgloss CLI
 *
 * Usage:
 *   lipgloss [options]
 *   lipgloss --json          Output demo data as JSON (agent-friendly)
 *   lipgloss --help          Show help
 *
 * Exit codes:
 *   0  Success
 *   1  Error
 */

import { NewStyle, JoinHorizontal, JoinVertical, Top, Center, Left, Right } from './index.js';

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`Usage: lipgloss [options]

Options:
  --json    Output demo data as JSON (machine-readable)
  --help    Show this help message

Exit codes:
  0  Success
  1  Error`);
  process.exit(0);
}

if (args.includes('--json')) {
  const output = {
    name: '@indiekit/lipgloss',
    version: '0.1.0',
    borders: ['normal', 'rounded', 'double', 'thick', 'hidden', 'block', 'ascii', 'none'],
    positions: { top: 0, bottom: 1, center: 0.5, left: 0, right: 1 },
    features: [
      'chainable-immutable-api',
      'true-color',
      'ansi-256',
      'borders',
      'padding',
      'margin',
      'alignment',
      'width-height-constraints',
      'horizontal-vertical-join',
      'place-layout',
      'word-wrap',
      'cjk-emoji-support',
      'zero-dependencies',
      'mcp-server',
    ],
    demo: {
      styled_text: NewStyle().bold().foreground('#FF6B6B').render('Bold Red Title'),
      bordered_box: NewStyle().border('rounded').padding(0, 1).render('Hello lipgloss'),
    },
  };
  console.log(JSON.stringify(output, null, 2));
  process.exit(0);
}

// ─── Visual Demo ───

console.log('\n🎨 @indiekit/lipgloss - Terminal Styling Demo\n');

// Basic text styling
const title = NewStyle()
  .bold()
  .foreground('#FF6B6B')
  .render('Bold Red Title');

const subtitle = NewStyle()
  .italic()
  .faint()
  .foreground('#888888')
  .render('Italic faint subtitle');

console.log(title);
console.log(subtitle);
console.log();

// Box with border
const box = NewStyle()
  .border('rounded')
  .borderForeground('#874BFD')
  .padding(1, 3)
  .width(40)
  .align(Center)
  .foreground('#FAFAFA')
  .background('#2D2D2D')
  .render('Hello from lipgloss-ts!\nCSS-like terminal styling');

console.log(box);
console.log();

// Multiple border styles
const borderStyles = ['normal', 'rounded', 'double', 'thick', 'hidden'] as const;
for (const name of borderStyles) {
  const b = NewStyle()
    .border(name)
    .borderForeground('#00FA68')
    .padding(0, 1)
    .render(name);
  process.stdout.write(b + '  ');
}
console.log('\n');

// Layout: horizontal join
const left = NewStyle()
  .border('rounded')
  .borderForeground('#FF6B6B')
  .padding(1, 2)
  .width(24)
  .align(Center)
  .render('Left Panel');

const right = NewStyle()
  .border('rounded')
  .borderForeground('#874BFD')
  .padding(1, 2)
  .width(24)
  .align(Center)
  .render('Right Panel');

console.log('Horizontal Join (top-aligned):');
console.log(JoinHorizontal(Top, left, right));
console.log();

// Vertical join
const top = NewStyle()
  .border('normal')
  .borderForeground('#00FA68')
  .padding(0, 2)
  .width(50)
  .align(Center)
  .render('Top Section');

const bottom = NewStyle()
  .border('double')
  .borderForeground('#FF6B6B')
  .padding(0, 2)
  .width(50)
  .align(Center)
  .render('Bottom Section');

console.log('Vertical Join:');
console.log(JoinVertical(Left, top, bottom));
console.log();

// Color palette
const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#874BFD'];
let palette = '';
for (const c of colors) {
  palette += NewStyle().background(c).foreground('#000').padding(0, 1).render('  ') + ' ';
}
console.log('Color Palette:');
console.log(palette);
console.log();

// Styled list
const listStyle = NewStyle()
  .border('rounded')
  .borderForeground('#874BFD')
  .padding(1, 2)
  .width(40);

const items = ['✅ Chainable API', '🎨 True Color support', '📦 Zero dependencies', '📐 Layout utilities'];
const list = items.join('\n');
console.log(listStyle.render(list));

console.log('\n✨ All done!\n');
process.exit(0);
