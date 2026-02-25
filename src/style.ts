import type { Border, ColorValue, Position } from './types.js';
import { Left, Top, clampPosition, Center, Right, Bottom } from './types.js';
import { getBorderByName, isNoBorder, noBorder } from './border.js';
import { parseColor, fgSequence, bgSequence, RESET, type RGBA } from './color.js';
import { getLines, stringWidth, stripAnsi } from './size.js';

/**
 * Build ANSI style string from attributes and colors.
 */
function buildStyle(opts: {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  reverse?: boolean;
  blink?: boolean;
  faint?: boolean;
  fg?: RGBA | null;
  bg?: RGBA | null;
}): string {
  const parts: string[] = [];
  if (opts.bold) parts.push('\x1b[1m');
  if (opts.faint) parts.push('\x1b[2m');
  if (opts.italic) parts.push('\x1b[3m');
  if (opts.underline) parts.push('\x1b[4m');
  if (opts.blink) parts.push('\x1b[5m');
  if (opts.reverse) parts.push('\x1b[7m');
  if (opts.strikethrough) parts.push('\x1b[9m');
  if (opts.fg) parts.push(fgSequence(opts.fg));
  if (opts.bg) parts.push(bgSequence(opts.bg));
  return parts.join('');
}

function applyStyleToStr(style: string, str: string): string {
  if (!style) return str;
  return style + str + RESET;
}

function whichSides<T>(values: T[]): [T, T, T, T] | null {
  switch (values.length) {
    case 1: return [values[0], values[0], values[0], values[0]];
    case 2: return [values[0], values[1], values[0], values[1]];
    case 3: return [values[0], values[1], values[2], values[1]];
    case 4: return [values[0], values[1], values[2], values[3]];
    default: return null;
  }
}

/**
 * Simple word-wrap that preserves ANSI escape sequences.
 */
function wordWrap(str: string, width: number): string {
  if (width <= 0) return str;
  const lines = str.split('\n');
  const result: string[] = [];

  for (const line of lines) {
    if (stringWidth(line) <= width) {
      result.push(line);
      continue;
    }
    // Simple character-level wrap
    let current = '';
    let currentWidth = 0;
    // Track ANSI state
    let i = 0;
    const raw = line;
    while (i < raw.length) {
      // Check for ANSI escape
      if (raw[i] === '\x1b' && raw[i + 1] === '[') {
        let j = i + 2;
        while (j < raw.length && raw[j] !== 'm') j++;
        current += raw.slice(i, j + 1);
        i = j + 1;
        continue;
      }
      if (raw[i] === '\x1b' && raw[i + 1] === ']') {
        // OSC sequence
        let j = i + 2;
        while (j < raw.length && !(raw[j] === '\x1b' && raw[j + 1] === '\\')) j++;
        current += raw.slice(i, j + 2);
        i = j + 2;
        continue;
      }

      const ch = raw[i];
      const cp = ch.codePointAt(0)!;
      const charW = isWideChar(cp) ? 2 : 1;

      if (currentWidth + charW > width) {
        result.push(current);
        current = '';
        currentWidth = 0;
      }
      current += ch;
      currentWidth += charW;
      i += ch.length;
    }
    if (current) result.push(current);
  }

  return result.join('\n');
}

function isWideChar(cp: number): boolean {
  return (
    (cp >= 0x1100 && cp <= 0x115f) ||
    (cp >= 0x2e80 && cp <= 0x303e) ||
    (cp >= 0x3040 && cp <= 0x33bf) ||
    (cp >= 0x3400 && cp <= 0x4dbf) ||
    (cp >= 0x4e00 && cp <= 0xa4cf) ||
    (cp >= 0xac00 && cp <= 0xd7a3) ||
    (cp >= 0xf900 && cp <= 0xfaff) ||
    (cp >= 0xff01 && cp <= 0xff60) ||
    (cp >= 0x1f300 && cp <= 0x1f9ff) ||
    (cp >= 0x20000 && cp <= 0x2fffd)
  );
}

/**
 * Pad each line of str on left or right with n characters.
 */
function padLines(str: string, n: number, style: string, char: string, side: 'left' | 'right'): string {
  if (n <= 0) return str;
  const pad = char.repeat(n);
  const styledPad = style ? applyStyleToStr(style, pad) : pad;
  return str.split('\n').map(line =>
    side === 'left' ? styledPad + line : line + styledPad
  ).join('\n');
}

/**
 * Horizontally align text, also making all lines equal width.
 */
function alignTextHorizontal(str: string, pos: Position, w: number, wsStyle: string): string {
  const [lines, widestLine] = getLines(str);
  const result: string[] = [];

  for (const l of lines) {
    const lineWidth = stringWidth(l);
    let shortAmount = widestLine - lineWidth;
    shortAmount += Math.max(0, w - (shortAmount + lineWidth));

    if (shortAmount > 0) {
      if (pos === Right || pos === 1) {
        const s = ' '.repeat(shortAmount);
        result.push((wsStyle ? applyStyleToStr(wsStyle, s) : s) + l);
      } else if (pos === Center || pos === 0.5) {
        const left = Math.floor(shortAmount / 2);
        const right = shortAmount - left;
        const ls = ' '.repeat(left);
        const rs = ' '.repeat(right);
        result.push(
          (wsStyle ? applyStyleToStr(wsStyle, ls) : ls) +
          l +
          (wsStyle ? applyStyleToStr(wsStyle, rs) : rs)
        );
      } else {
        // Left (default)
        const s = ' '.repeat(shortAmount);
        result.push(l + (wsStyle ? applyStyleToStr(wsStyle, s) : s));
      }
    } else {
      result.push(l);
    }
  }

  return result.join('\n');
}

function alignTextVertical(str: string, pos: Position, h: number): string {
  const strHeight = str.split('\n').length;
  if (h <= strHeight) return str;

  const gap = h - strHeight;
  if (pos === Top || pos === 0) {
    return str + '\n'.repeat(gap);
  } else if (pos === Bottom || pos === 1) {
    return '\n'.repeat(gap) + str;
  } else {
    // Center
    let topPad = Math.floor(gap / 2);
    let bottomPad = Math.floor(gap / 2);
    if (strHeight + topPad + bottomPad > h) topPad--;
    else if (strHeight + topPad + bottomPad < h) bottomPad++;
    return '\n'.repeat(topPad) + str + '\n'.repeat(bottomPad);
  }
}

/**
 * Render a horizontal border edge (top or bottom).
 */
function renderHorizontalEdge(left: string, middle: string, right: string, w: number): string {
  if (!middle) middle = ' ';
  const leftW = stringWidth(left);
  const rightW = stringWidth(right);
  const runes = [...middle];
  let out = left;
  let j = 0;
  for (let i = 0; i < w - leftW - rightW;) {
    const r = runes[j % runes.length];
    out += r;
    i += stringWidth(r);
    j++;
  }
  out += right;
  return out;
}

/**
 * Immutable style builder for terminal output.
 *
 * Every setter returns a new Style instance (immutable/chainable pattern).
 * Call `.render(text)` to produce the final ANSI-styled string.
 *
 * @example
 * ```ts
 * const style = NewStyle()
 *   .bold()
 *   .foreground('#FF6B6B')
 *   .border('rounded')
 *   .padding(1, 2);
 *
 * console.log(style.render('Hello!'));
 * ```
 */
export class Style {
  // Text attributes
  private _bold = false;
  private _italic = false;
  private _underline = false;
  private _strikethrough = false;
  private _reverse = false;
  private _blink = false;
  private _faint = false;

  // Colors (parsed)
  private _fg: RGBA | null = null;
  private _bg: RGBA | null = null;

  // Dimensions
  private _width = 0;
  private _height = 0;
  private _maxWidth = 0;
  private _maxHeight = 0;

  // Alignment
  private _alignH: Position = Left;
  private _alignV: Position = Top;

  // Padding
  private _paddingTop = 0;
  private _paddingRight = 0;
  private _paddingBottom = 0;
  private _paddingLeft = 0;

  // Margin
  private _marginTop = 0;
  private _marginRight = 0;
  private _marginBottom = 0;
  private _marginLeft = 0;
  private _marginBg: RGBA | null = null;

  // Border
  private _borderStyle: Border = noBorder;
  private _borderTop = false;
  private _borderRight = false;
  private _borderBottom = false;
  private _borderLeft = false;
  private _borderTopFg: RGBA | null = null;
  private _borderRightFg: RGBA | null = null;
  private _borderBottomFg: RGBA | null = null;
  private _borderLeftFg: RGBA | null = null;
  private _borderTopBg: RGBA | null = null;
  private _borderRightBg: RGBA | null = null;
  private _borderBottomBg: RGBA | null = null;
  private _borderLeftBg: RGBA | null = null;

  // Track which sides were explicitly set
  private _borderSidesSet = false;
  private _borderStyleSet = false;

  // Inline mode
  private _inline = false;

  // Tab width
  private _tabWidth = 4;

  // Transform
  private _transform: ((s: string) => string) | null = null;

  // Stored value for stringer
  private _value = '';

  // Track if any props set
  private _hasProps = false;

  // Color whitespace
  private _colorWhitespace = true;

  // ─── Chainable setters ───

  /** Enable/disable bold text. */
  bold(v = true): Style { const s = this._clone(); s._bold = v; s._hasProps = true; return s; }
  italic(v = true): Style { const s = this._clone(); s._italic = v; s._hasProps = true; return s; }
  underline(v = true): Style { const s = this._clone(); s._underline = v; s._hasProps = true; return s; }
  strikethrough(v = true): Style { const s = this._clone(); s._strikethrough = v; s._hasProps = true; return s; }
  reverse(v = true): Style { const s = this._clone(); s._reverse = v; s._hasProps = true; return s; }
  blink(v = true): Style { const s = this._clone(); s._blink = v; s._hasProps = true; return s; }
  faint(v = true): Style { const s = this._clone(); s._faint = v; s._hasProps = true; return s; }

  /** Set foreground color. Accepts hex (`'#FF6B6B'`), ANSI index (`196`), or `{r,g,b}`. */
  foreground(c: ColorValue): Style { const s = this._clone(); s._fg = parseColor(c); s._hasProps = true; return s; }
  /** Set background color. Accepts hex (`'#FF6B6B'`), ANSI index (`196`), or `{r,g,b}`. */
  background(c: ColorValue): Style { const s = this._clone(); s._bg = parseColor(c); s._hasProps = true; return s; }

  /** Set fixed width (includes border). Content is wrapped/padded to fit. */
  width(w: number): Style { const s = this._clone(); s._width = Math.max(0, w); s._hasProps = true; return s; }
  /** Set fixed height (includes border). Content is aligned vertically to fit. */
  height(h: number): Style { const s = this._clone(); s._height = Math.max(0, h); s._hasProps = true; return s; }
  /** Set maximum width. Output is truncated if wider. */
  maxWidth(w: number): Style { const s = this._clone(); s._maxWidth = Math.max(0, w); s._hasProps = true; return s; }
  /** Set maximum height. Output is truncated if taller. */
  maxHeight(h: number): Style { const s = this._clone(); s._maxHeight = Math.max(0, h); s._hasProps = true; return s; }

  align(...pos: Position[]): Style {
    const s = this._clone();
    if (pos.length > 0) s._alignH = pos[0];
    if (pos.length > 1) s._alignV = pos[1];
    s._hasProps = true;
    return s;
  }
  alignHorizontal(p: Position): Style { const s = this._clone(); s._alignH = p; s._hasProps = true; return s; }
  alignVertical(p: Position): Style { const s = this._clone(); s._alignV = p; s._hasProps = true; return s; }

  /** Set padding (CSS shorthand: 1-4 values for top/right/bottom/left). */
  padding(...values: number[]): Style {
    const sides = whichSides(values);
    if (!sides) return this;
    const s = this._clone();
    [s._paddingTop, s._paddingRight, s._paddingBottom, s._paddingLeft] = sides.map(v => Math.max(0, v)) as [number, number, number, number];
    s._hasProps = true;
    return s;
  }
  paddingTop(v: number): Style { const s = this._clone(); s._paddingTop = Math.max(0, v); s._hasProps = true; return s; }
  paddingRight(v: number): Style { const s = this._clone(); s._paddingRight = Math.max(0, v); s._hasProps = true; return s; }
  paddingBottom(v: number): Style { const s = this._clone(); s._paddingBottom = Math.max(0, v); s._hasProps = true; return s; }
  paddingLeft(v: number): Style { const s = this._clone(); s._paddingLeft = Math.max(0, v); s._hasProps = true; return s; }

  /** Set margin (CSS shorthand: 1-4 values for top/right/bottom/left). */
  margin(...values: number[]): Style {
    const sides = whichSides(values);
    if (!sides) return this;
    const s = this._clone();
    [s._marginTop, s._marginRight, s._marginBottom, s._marginLeft] = sides.map(v => Math.max(0, v)) as [number, number, number, number];
    s._hasProps = true;
    return s;
  }
  marginTop(v: number): Style { const s = this._clone(); s._marginTop = Math.max(0, v); s._hasProps = true; return s; }
  marginRight(v: number): Style { const s = this._clone(); s._marginRight = Math.max(0, v); s._hasProps = true; return s; }
  marginBottom(v: number): Style { const s = this._clone(); s._marginBottom = Math.max(0, v); s._hasProps = true; return s; }
  marginLeft(v: number): Style { const s = this._clone(); s._marginLeft = Math.max(0, v); s._hasProps = true; return s; }
  marginBackground(c: ColorValue): Style { const s = this._clone(); s._marginBg = parseColor(c); s._hasProps = true; return s; }

  /**
   * Set border style and optionally which sides to draw.
   *
   * Accepts a `Border` object or a string name: `'normal'`, `'rounded'`,
   * `'double'`, `'thick'`, `'hidden'`, `'block'`, `'ascii'`, `'none'`.
   * border(style) - set style, all sides on by default
   * border(style, top, right, bottom, left) - CSS-like sides
   * border('rounded') - use string name
   */
  border(b: Border | string, ...sides: boolean[]): Style {
    const s = this._clone();
    s._borderStyle = typeof b === 'string' ? getBorderByName(b) : b;
    s._borderStyleSet = true;
    s._hasProps = true;

    const sideValues = whichSides(sides);
    if (sideValues) {
      [s._borderTop, s._borderRight, s._borderBottom, s._borderLeft] = sideValues;
      s._borderSidesSet = true;
    }
    return s;
  }

  borderStyle(b: Border | string): Style {
    const s = this._clone();
    s._borderStyle = typeof b === 'string' ? getBorderByName(b) : b;
    s._borderStyleSet = true;
    s._hasProps = true;
    return s;
  }

  borderTop(v: boolean): Style { const s = this._clone(); s._borderTop = v; s._borderSidesSet = true; s._hasProps = true; return s; }
  borderRight(v: boolean): Style { const s = this._clone(); s._borderRight = v; s._borderSidesSet = true; s._hasProps = true; return s; }
  borderBottom(v: boolean): Style { const s = this._clone(); s._borderBottom = v; s._borderSidesSet = true; s._hasProps = true; return s; }
  borderLeft(v: boolean): Style { const s = this._clone(); s._borderLeft = v; s._borderSidesSet = true; s._hasProps = true; return s; }

  borderForeground(...colors: ColorValue[]): Style {
    if (colors.length === 0) return this;
    const sides = whichSides(colors);
    if (!sides) return this;
    const s = this._clone();
    s._borderTopFg = parseColor(sides[0]);
    s._borderRightFg = parseColor(sides[1]);
    s._borderBottomFg = parseColor(sides[2]);
    s._borderLeftFg = parseColor(sides[3]);
    s._hasProps = true;
    return s;
  }

  borderBackground(...colors: ColorValue[]): Style {
    if (colors.length === 0) return this;
    const sides = whichSides(colors);
    if (!sides) return this;
    const s = this._clone();
    s._borderTopBg = parseColor(sides[0]);
    s._borderRightBg = parseColor(sides[1]);
    s._borderBottomBg = parseColor(sides[2]);
    s._borderLeftBg = parseColor(sides[3]);
    s._hasProps = true;
    return s;
  }

  inline(v = true): Style { const s = this._clone(); s._inline = v; s._hasProps = true; return s; }
  tabWidth(n: number): Style { const s = this._clone(); s._tabWidth = n <= -1 ? -1 : n; s._hasProps = true; return s; }
  colorWhitespace(v: boolean): Style { const s = this._clone(); s._colorWhitespace = v; s._hasProps = true; return s; }
  transform(fn: (s: string) => string): Style { const s = this._clone(); s._transform = fn; s._hasProps = true; return s; }

  setValue(str: string): Style { const s = this._clone(); s._value = str; return s; }

  // ─── Getters ───

  getBold(): boolean { return this._bold; }
  getItalic(): boolean { return this._italic; }
  getUnderline(): boolean { return this._underline; }
  getStrikethrough(): boolean { return this._strikethrough; }
  getReverse(): boolean { return this._reverse; }
  getBlink(): boolean { return this._blink; }
  getFaint(): boolean { return this._faint; }
  getForeground(): ColorValue { return this._fg ? null : null; } // simplified
  getBackground(): ColorValue { return this._bg ? null : null; }
  getWidth(): number { return this._width; }
  getHeight(): number { return this._height; }
  getMaxWidth(): number { return this._maxWidth; }
  getMaxHeight(): number { return this._maxHeight; }
  getAlign(): Position { return this._alignH; }
  getAlignHorizontal(): Position { return this._alignH; }
  getAlignVertical(): Position { return this._alignV; }
  getPaddingTop(): number { return this._paddingTop; }
  getPaddingRight(): number { return this._paddingRight; }
  getPaddingBottom(): number { return this._paddingBottom; }
  getPaddingLeft(): number { return this._paddingLeft; }
  getHorizontalPadding(): number { return this._paddingLeft + this._paddingRight; }
  getVerticalPadding(): number { return this._paddingTop + this._paddingBottom; }
  getMarginTop(): number { return this._marginTop; }
  getMarginRight(): number { return this._marginRight; }
  getMarginBottom(): number { return this._marginBottom; }
  getMarginLeft(): number { return this._marginLeft; }
  getHorizontalMargins(): number { return this._marginLeft + this._marginRight; }
  getVerticalMargins(): number { return this._marginTop + this._marginBottom; }
  getInline(): boolean { return this._inline; }
  getTabWidth(): number { return this._tabWidth; }

  getBorderStyle(): Border { return this._borderStyle; }
  getBorderTop(): boolean { return this._shouldRenderBorderSide('top'); }
  getBorderRight(): boolean { return this._shouldRenderBorderSide('right'); }
  getBorderBottom(): boolean { return this._shouldRenderBorderSide('bottom'); }
  getBorderLeft(): boolean { return this._shouldRenderBorderSide('left'); }

  getHorizontalBorderSize(): number {
    return (this._shouldRenderBorderSide('left') ? 1 : 0) + (this._shouldRenderBorderSide('right') ? 1 : 0);
  }
  getVerticalBorderSize(): number {
    return (this._shouldRenderBorderSide('top') ? 1 : 0) + (this._shouldRenderBorderSide('bottom') ? 1 : 0);
  }
  getHorizontalFrameSize(): number {
    return this.getHorizontalMargins() + this.getHorizontalPadding() + this.getHorizontalBorderSize();
  }
  getVerticalFrameSize(): number {
    return this.getVerticalMargins() + this.getVerticalPadding() + this.getVerticalBorderSize();
  }
  getFrameSize(): [number, number] {
    return [this.getHorizontalFrameSize(), this.getVerticalFrameSize()];
  }

  // ─── Rendering ───

  /**
   * Render one or more strings with this style applied.
   * Multiple strings are joined with spaces.
   */
  render(...strs: string[]): string {
    const parts = this._value ? [this._value, ...strs] : strs;
    let str = parts.join(' ');

    if (this._transform) {
      str = this._transform(str);
    }

    if (!this._hasProps) {
      return this._maybeConvertTabs(str);
    }

    // Build core style sequence
    const styleSeq = buildStyle({
      bold: this._bold,
      italic: this._italic,
      underline: this._underline,
      strikethrough: this._strikethrough,
      reverse: this._reverse,
      blink: this._blink,
      faint: this._faint,
      fg: this._fg,
      bg: this._bg,
    });

    // Build whitespace style (for padding/alignment spaces)
    const wsStyle = buildStyle({
      reverse: this._reverse,
      bg: this._colorWhitespace ? this._bg : null,
    });

    // Convert tabs
    str = this._maybeConvertTabs(str);
    str = str.replace(/\r\n/g, '\n');

    if (this._inline) {
      str = str.replace(/\n/g, '');
    }

    const hasTop = this._shouldRenderBorderSide('top');
    const hasRight = this._shouldRenderBorderSide('right');
    const hasBottom = this._shouldRenderBorderSide('bottom');
    const hasLeft = this._shouldRenderBorderSide('left');
    const hBorderSize = (hasLeft ? 1 : 0) + (hasRight ? 1 : 0);
    const vBorderSize = (hasTop ? 1 : 0) + (hasBottom ? 1 : 0);

    let w = this._width - hBorderSize;
    let h = this._height - vBorderSize;

    // Word wrap
    if (!this._inline && w > 0) {
      const wrapAt = w - this._paddingLeft - this._paddingRight;
      str = wordWrap(str, wrapAt);
    }

    // Apply text style to each line
    if (styleSeq) {
      str = str.split('\n').map(line => applyStyleToStr(styleSeq, line)).join('\n');
    }

    // Padding
    if (!this._inline) {
      if (this._paddingLeft > 0) {
        str = padLines(str, this._paddingLeft, wsStyle, ' ', 'left');
      }
      if (this._paddingRight > 0) {
        str = padLines(str, this._paddingRight, wsStyle, ' ', 'right');
      }
      if (this._paddingTop > 0) {
        str = '\n'.repeat(this._paddingTop) + str;
      }
      if (this._paddingBottom > 0) {
        str += '\n'.repeat(this._paddingBottom);
      }
    }

    // Height
    if (h > 0) {
      str = alignTextVertical(str, this._alignV, h);
    }

    // Horizontal alignment (also pads lines to equal width)
    {
      const numLines = (str.match(/\n/g) || []).length;
      if (numLines > 0 || w > 0) {
        str = alignTextHorizontal(str, this._alignH, Math.max(0, w), wsStyle);
      }
    }

    // Borders
    if (!this._inline) {
      str = this._applyBorder(str);

      // Margins
      str = this._applyMargins(str);
    }

    // MaxWidth truncation
    if (this._maxWidth > 0) {
      str = str.split('\n').map(line => truncateToWidth(line, this._maxWidth)).join('\n');
    }

    // MaxHeight truncation
    if (this._maxHeight > 0) {
      const lines = str.split('\n');
      if (lines.length > this._maxHeight) {
        str = lines.slice(0, this._maxHeight).join('\n');
      }
    }

    return str;
  }

  toString(): string {
    return this.render();
  }

  // ─── Internal ───

  private _clone(): Style {
    const s = new Style();
    Object.assign(s, this);
    return s;
  }

  private _shouldRenderBorderSide(side: string): boolean {
    // If border style set but no sides explicitly set, all sides on
    if (this._borderStyleSet && !this._borderSidesSet && !isNoBorder(this._borderStyle)) {
      return true;
    }
    switch (side) {
      case 'top': return this._borderTop;
      case 'right': return this._borderRight;
      case 'bottom': return this._borderBottom;
      case 'left': return this._borderLeft;
      default: return false;
    }
  }

  private _maybeConvertTabs(str: string): string {
    if (this._tabWidth === -1) return str;
    if (this._tabWidth === 0) return str.replace(/\t/g, '');
    return str.replace(/\t/g, ' '.repeat(this._tabWidth));
  }

  private _styleBorder(border: string, fg: RGBA | null, bg: RGBA | null): string {
    if (!fg && !bg) return border;
    let seq = '';
    if (fg) seq += fgSequence(fg);
    if (bg) seq += bgSequence(bg);
    return seq + border + RESET;
  }

  private _applyBorder(str: string): string {
    const border = { ...this._borderStyle };
    const hasTop = this._shouldRenderBorderSide('top');
    const hasRight = this._shouldRenderBorderSide('right');
    const hasBottom = this._shouldRenderBorderSide('bottom');
    const hasLeft = this._shouldRenderBorderSide('left');

    if (isNoBorder(border) || (!hasTop && !hasRight && !hasBottom && !hasLeft)) {
      return str;
    }

    const [lines, w] = getLines(str);
    let totalWidth = w;

    if (hasLeft) {
      if (!border.left) border.left = ' ';
      totalWidth += stringWidth(border.left);
    }
    if (hasRight) {
      if (!border.right) border.right = ' ';
      totalWidth += stringWidth(border.right);
    }

    // Fix corners
    if (hasTop && hasLeft && !border.topLeft) border.topLeft = ' ';
    if (hasTop && hasRight && !border.topRight) border.topRight = ' ';
    if (hasBottom && hasLeft && !border.bottomLeft) border.bottomLeft = ' ';
    if (hasBottom && hasRight && !border.bottomRight) border.bottomRight = ' ';

    if (hasTop && !hasLeft) border.topLeft = '';
    if (hasTop && !hasRight) border.topRight = '';
    if (hasBottom && !hasLeft) border.bottomLeft = '';
    if (hasBottom && !hasRight) border.bottomRight = '';

    let out = '';

    // Top
    if (hasTop) {
      const top = renderHorizontalEdge(border.topLeft, border.top, border.topRight, totalWidth);
      out += this._styleBorder(top, this._borderTopFg, this._borderTopBg) + '\n';
    }

    // Content lines with side borders
    for (let i = 0; i < lines.length; i++) {
      if (hasLeft) {
        const leftRunes = [...border.left];
        const r = leftRunes[i % leftRunes.length];
        out += this._styleBorder(r, this._borderLeftFg, this._borderLeftBg);
      }
      out += lines[i];
      if (hasRight) {
        const rightRunes = [...border.right];
        const r = rightRunes[i % rightRunes.length];
        out += this._styleBorder(r, this._borderRightFg, this._borderRightBg);
      }
      if (i < lines.length - 1) out += '\n';
    }

    // Bottom
    if (hasBottom) {
      const bottom = renderHorizontalEdge(border.bottomLeft, border.bottom, border.bottomRight, totalWidth);
      out += '\n' + this._styleBorder(bottom, this._borderBottomFg, this._borderBottomBg);
    }

    return out;
  }

  private _applyMargins(str: string): string {
    const marginStyle = this._marginBg ? bgSequence(this._marginBg) : '';
    const marginReset = this._marginBg ? RESET : '';

    // Left/right margin
    if (this._marginLeft > 0) {
      const pad = ' '.repeat(this._marginLeft);
      const styledPad = marginStyle ? marginStyle + pad + marginReset : pad;
      str = str.split('\n').map(line => styledPad + line).join('\n');
    }
    if (this._marginRight > 0) {
      const pad = ' '.repeat(this._marginRight);
      const styledPad = marginStyle ? marginStyle + pad + marginReset : pad;
      str = str.split('\n').map(line => line + styledPad).join('\n');
    }

    // Top/bottom margin
    if (this._marginTop > 0) {
      const [, w] = getLines(str);
      const emptyLine = ' '.repeat(w);
      const styled = marginStyle ? marginStyle + emptyLine + marginReset : emptyLine;
      str = (styled + '\n').repeat(this._marginTop) + str;
    }
    if (this._marginBottom > 0) {
      const [, w] = getLines(str);
      const emptyLine = ' '.repeat(w);
      const styled = marginStyle ? marginStyle + emptyLine + marginReset : emptyLine;
      str += ('\n' + styled).repeat(this._marginBottom);
    }

    return str;
  }
}

/**
 * Truncate a string to a given visible width, preserving ANSI.
 */
function truncateToWidth(str: string, maxW: number): string {
  let visW = 0;
  let result = '';
  let i = 0;
  while (i < str.length) {
    // ANSI escape
    if (str[i] === '\x1b' && str[i + 1] === '[') {
      let j = i + 2;
      while (j < str.length && str[j] !== 'm') j++;
      result += str.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    const ch = str[i];
    const cp = ch.codePointAt(0)!;
    const charW = isWideChar(cp) ? 2 : 1;
    if (visW + charW > maxW) break;
    result += ch;
    visW += charW;
    i += ch.length;
  }
  // If we have any open ANSI, reset
  if (result.includes('\x1b[') && !result.endsWith(RESET)) {
    result += RESET;
  }
  return result;
}

/**
 * Create a new empty Style.
 */
export function NewStyle(): Style {
  return new Style();
}
