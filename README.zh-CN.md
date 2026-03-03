[English](README.md) | [中文](README.zh-CN.md)

# @indiekit/lipgloss

[![npm version](https://img.shields.io/npm/v/@indiekit/lipgloss)](https://www.npmjs.com/package/@indiekit/lipgloss)
[![license](https://img.shields.io/npm/l/@indiekit/lipgloss)](./LICENSE)
[![tests](https://img.shields.io/badge/tests-83%20passed-brightgreen)](#)

TypeScript 终端样式与布局库 — [charmbracelet/lipgloss](https://github.com/charmbracelet/lipgloss) 的移植版。

**零依赖。不可变 API。布局支持。True Color。**

## 特性

```
╭──────────────────────────────────╮
│                                  │
│   ✅ 链式、不可变 API            │
│   🎨 True Color + ANSI 256      │
│   📦 零运行时依赖                │
│   📐 水平和垂直布局拼接          │
│   🔲 7 种边框样式                │
│   📏 宽度/高度约束               │
│   🀄 CJK 和 emoji 宽度支持      │
│   🤖 内置 MCP server            │
│                                  │
╰──────────────────────────────────╯
```

### 边框样式

```
┌────────┐  ╭────────╮  ╔════════╗  ┏━━━━━━━━┓
│ normal │  │rounded │  ║ double ║  ┃ thick  ┃
└────────┘  ╰────────╯  ╚════════╝  ┗━━━━━━━━┛

+--------+  ████████████
| ascii  |  █  block   █
+--------+  ████████████
```

### 颜色支持

```ts
// Hex 颜色（3 或 6 位）
style.foreground('#FF6B6B')
style.background('#2D2D2D')

// ANSI 256 索引
style.foreground(196)    // 亮红色
style.background(236)    // 深灰色

// RGB 对象
style.foreground({ r: 255, g: 107, b: 107 })
```

### 布局

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

## 安装

```bash
npm install @indiekit/lipgloss
```

## 快速开始

```ts
import { NewStyle, JoinHorizontal, Top, Center } from '@indiekit/lipgloss';

// 创建带样式的盒子
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

// 布局：两个面板并排
const left = NewStyle().border('rounded').padding(1, 2).render('Panel A');
const right = NewStyle().border('rounded').padding(1, 2).render('Panel B');
console.log(JoinHorizontal(Top, left, right));
```

## API

### `NewStyle(): Style`

创建一个空的 `Style`。每个方法都返回一个**新的** Style（不可变）。

### Style 方法

#### 文本属性

| 方法 | 说明 |
|------|------|
| `.bold(v?)` | 粗体 |
| `.italic(v?)` | 斜体 |
| `.underline(v?)` | 下划线 |
| `.strikethrough(v?)` | 删除线 |
| `.faint(v?)` | 暗淡文本 |
| `.blink(v?)` | 闪烁 |
| `.reverse(v?)` | 前景/背景色互换 |

均接受可选的 boolean 参数（默认 `true`）。

#### 颜色

| 方法 | 说明 |
|------|------|
| `.foreground(color)` | 设置文本颜色 |
| `.background(color)` | 设置背景颜色 |

`ColorValue` = `string`（hex）\| `number`（ANSI 0-255）\| `{ r, g, b }` \| `null`

#### 尺寸

| 方法 | 说明 |
|------|------|
| `.width(n)` | 固定宽度（内容自动换行） |
| `.height(n)` | 固定高度（内容自动对齐） |
| `.maxWidth(n)` | 最大宽度（超出截断） |
| `.maxHeight(n)` | 最大高度（超出截断） |

#### 对齐

| 方法 | 说明 |
|------|------|
| `.align(h, v?)` | 设置水平（和可选的垂直）对齐 |
| `.alignHorizontal(pos)` | `Left` (0)、`Center` (0.5)、`Right` (1) |
| `.alignVertical(pos)` | `Top` (0)、`Center` (0.5)、`Bottom` (1) |

#### Padding 和 Margin

CSS 简写 — 1 到 4 个值：`(all)`、`(v, h)`、`(top, h, bottom)`、`(top, right, bottom, left)`。

| 方法 | 说明 |
|------|------|
| `.padding(...n)` | 内边距 |
| `.paddingTop/Right/Bottom/Left(n)` | 单边内边距 |
| `.margin(...n)` | 外边距 |
| `.marginTop/Right/Bottom/Left(n)` | 单边外边距 |
| `.marginBackground(color)` | 外边距区域颜色 |

#### 边框

| 方法 | 说明 |
|------|------|
| `.border(style, ...sides?)` | 设置边框样式 + 可选边（CSS 简写 boolean） |
| `.borderStyle(style)` | 仅设置边框样式 |
| `.borderTop/Right/Bottom/Left(bool)` | 切换单边边框 |
| `.borderForeground(...colors)` | 边框颜色（1-4 个值，CSS 简写） |
| `.borderBackground(...colors)` | 边框背景色（1-4 个值） |

边框样式：`'normal'`、`'rounded'`、`'double'`、`'thick'`、`'hidden'`、`'block'`、`'ascii'`、`'none'`

或使用预置对象：`NormalBorder`、`RoundedBorder`、`DoubleBorder`、`ThickBorder`、`HiddenBorder`、`BlockBorder`、`ASCIIBorder`、`NoBorder`。

#### 其他

| 方法 | 说明 |
|------|------|
| `.inline(v?)` | 去除换行符 |
| `.tabWidth(n)` | Tab 宽度（-1 保留 tab） |
| `.colorWhitespace(v)` | 对 padding 空格应用背景色 |
| `.transform(fn)` | 渲染前对文本做变换 |
| `.setValue(str)` | 存储默认值 |

#### 渲染

| 方法 | 说明 |
|------|------|
| `.render(...strs)` | 渲染带样式的输出 |
| `.toString()` | 同 `.render()` |

#### Getter

每个 setter 都有对应的 getter：`getBold()`、`getWidth()`、`getPaddingTop()`、`getHorizontalFrameSize()`、`getFrameSize()` 等。

### 布局函数

```ts
import { JoinHorizontal, JoinVertical, Place, PlaceHorizontal, PlaceVertical } from '@indiekit/lipgloss';
```

| 函数 | 说明 |
|------|------|
| `JoinHorizontal(pos, ...strs)` | 水平拼接。`pos`：垂直对齐（Top/Center/Bottom） |
| `JoinVertical(pos, ...strs)` | 垂直堆叠。`pos`：水平对齐（Left/Center/Right） |
| `Place(w, h, hPos, vPos, str)` | 将字符串放置在 w×h 的区域中 |
| `PlaceHorizontal(w, pos, str)` | 将字符串放置在固定宽度空间中 |
| `PlaceVertical(h, pos, str)` | 将字符串放置在固定高度空间中 |

### 测量

```ts
import { Width, Height, StringWidth } from '@indiekit/lipgloss';

Width('hello\nworld!');   // 6（最大行宽）
Height('hello\nworld!');  // 2（行数）
StringWidth('你好');       // 4（CJK 字符每个占 2 格）
```

### 位置常量

| 常量 | 值 | 用途 |
|------|----|------|
| `Top` / `Left` | `0` | 起始 |
| `Center` | `0.5` | 居中 |
| `Bottom` / `Right` | `1` | 末尾 |

任何 `0..1` 的浮点数都可以作为位置。

## CLI

```bash
# 可视化 demo
npx @indiekit/lipgloss

# 机器可读输出（给 agent/脚本用）
npx @indiekit/lipgloss --json
```

退出码：`0` = 成功，`1` = 错误。

## MCP Server

lipgloss 内置了 [Model Context Protocol](https://modelcontextprotocol.io) server，用于 AI agent 集成。

### 配置

添加到你的 MCP 客户端配置：

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

### 工具

| 工具 | 说明 |
|------|------|
| `style_render` | 渲染带颜色、边框、padding、对齐的样式文本 |
| `join_horizontal` | 水平拼接文本块 |
| `join_vertical` | 垂直堆叠文本块 |
| `measure` | 获取文本块的宽度和高度 |

### 示例

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

## 对比

### 与 Go lipgloss

| | Go lipgloss | @indiekit/lipgloss |
|---|---|---|
| 语言 | Go | TypeScript/JavaScript |
| API 风格 | 链式、不可变 | 链式、不可变 |
| 颜色 | 自适应（终端 profile） | True Color + ANSI 256 |
| 边框 | ✅ | ✅ 全部 7 种 |
| 布局 | ✅ JoinH/V, Place | ✅ JoinH/V, Place |
| Padding/Margin | ✅ | ✅ CSS 简写 |
| MCP server | ❌ | ✅ 内置 |
| 依赖 | Go stdlib | **零** |

### 与 chalk

| | chalk | @indiekit/lipgloss |
|---|---|---|
| 颜色 | ✅ | ✅ |
| 粗体/斜体等 | ✅ | ✅ |
| 边框 | ❌ | ✅ 7 种 |
| Padding/Margin | ❌ | ✅ |
| 宽度/高度 | ❌ | ✅ |
| 对齐 | ❌ | ✅ |
| 布局（拼接） | ❌ | ✅ |
| 不可变 | ❌（可变链式） | ✅ |
| 依赖 | 0 (v5) | **0** |

## 为什么选择 lipgloss-ts？

- **零依赖** — 无需审计，不会崩
- **不可变 API** — 样式就是值，可以安全地共享和组合
- **布局原语** — `JoinHorizontal`、`JoinVertical`、`Place`，构建真正的 TUI 布局
- **完整盒模型** — padding、margin、边框、对齐、宽高约束
- **CJK 和 emoji 感知** — 所有字符的宽度计算都正确
- **Agent 友好** — MCP server + `--json` CLI flag，方便机器消费

## License

MIT
