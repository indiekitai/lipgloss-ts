#!/usr/bin/env node
"use strict";

// src/types.ts
var Top = 0;
var Bottom = 1;
var Center = 0.5;
var Left = 0;
var Right = 1;
function clampPosition(p) {
  return Math.min(1, Math.max(0, p));
}

// src/border.ts
var noBorder = {
  top: "",
  bottom: "",
  left: "",
  right: "",
  topLeft: "",
  topRight: "",
  bottomLeft: "",
  bottomRight: "",
  middleLeft: "",
  middleRight: "",
  middle: "",
  middleTop: "",
  middleBottom: ""
};
var normalBorder = {
  top: "\u2500",
  bottom: "\u2500",
  left: "\u2502",
  right: "\u2502",
  topLeft: "\u250C",
  topRight: "\u2510",
  bottomLeft: "\u2514",
  bottomRight: "\u2518",
  middleLeft: "\u251C",
  middleRight: "\u2524",
  middle: "\u253C",
  middleTop: "\u252C",
  middleBottom: "\u2534"
};
var roundedBorder = {
  top: "\u2500",
  bottom: "\u2500",
  left: "\u2502",
  right: "\u2502",
  topLeft: "\u256D",
  topRight: "\u256E",
  bottomLeft: "\u2570",
  bottomRight: "\u256F",
  middleLeft: "\u251C",
  middleRight: "\u2524",
  middle: "\u253C",
  middleTop: "\u252C",
  middleBottom: "\u2534"
};
var thickBorder = {
  top: "\u2501",
  bottom: "\u2501",
  left: "\u2503",
  right: "\u2503",
  topLeft: "\u250F",
  topRight: "\u2513",
  bottomLeft: "\u2517",
  bottomRight: "\u251B",
  middleLeft: "\u2523",
  middleRight: "\u252B",
  middle: "\u254B",
  middleTop: "\u2533",
  middleBottom: "\u253B"
};
var doubleBorder = {
  top: "\u2550",
  bottom: "\u2550",
  left: "\u2551",
  right: "\u2551",
  topLeft: "\u2554",
  topRight: "\u2557",
  bottomLeft: "\u255A",
  bottomRight: "\u255D",
  middleLeft: "\u2560",
  middleRight: "\u2563",
  middle: "\u256C",
  middleTop: "\u2566",
  middleBottom: "\u2569"
};
var hiddenBorder = {
  top: " ",
  bottom: " ",
  left: " ",
  right: " ",
  topLeft: " ",
  topRight: " ",
  bottomLeft: " ",
  bottomRight: " ",
  middleLeft: " ",
  middleRight: " ",
  middle: " ",
  middleTop: " ",
  middleBottom: " "
};
var blockBorder = {
  top: "\u2588",
  bottom: "\u2588",
  left: "\u2588",
  right: "\u2588",
  topLeft: "\u2588",
  topRight: "\u2588",
  bottomLeft: "\u2588",
  bottomRight: "\u2588",
  middleLeft: "\u2588",
  middleRight: "\u2588",
  middle: "\u2588",
  middleTop: "\u2588",
  middleBottom: "\u2588"
};
var asciiBorder = {
  top: "-",
  bottom: "-",
  left: "|",
  right: "|",
  topLeft: "+",
  topRight: "+",
  bottomLeft: "+",
  bottomRight: "+",
  middleLeft: "+",
  middleRight: "+",
  middle: "+",
  middleTop: "+",
  middleBottom: "+"
};
function getBorderByName(name) {
  switch (name.toLowerCase()) {
    case "normal":
      return normalBorder;
    case "rounded":
      return roundedBorder;
    case "thick":
      return thickBorder;
    case "double":
      return doubleBorder;
    case "hidden":
      return hiddenBorder;
    case "block":
      return blockBorder;
    case "ascii":
      return asciiBorder;
    case "none":
      return noBorder;
    default:
      return noBorder;
  }
}
function isNoBorder(b) {
  return b.top === "" && b.bottom === "" && b.left === "" && b.right === "" && b.topLeft === "" && b.topRight === "" && b.bottomLeft === "" && b.bottomRight === "";
}

// src/color.ts
function parseColor(c) {
  if (c === null || c === void 0) return null;
  if (typeof c === "object" && "r" in c) {
    return { r: c.r & 255, g: c.g & 255, b: c.b & 255 };
  }
  if (typeof c === "number") {
    if (c < 0) c = -c;
    return { r: -1, g: -1, b: c };
  }
  if (typeof c === "string") {
    if (c.startsWith("#")) {
      return parseHex(c);
    }
    const n = parseInt(c, 10);
    if (!isNaN(n)) {
      return { r: -1, g: -1, b: n };
    }
  }
  return null;
}
function parseHex(s) {
  if (s.length === 7) {
    return {
      r: parseInt(s.slice(1, 3), 16),
      g: parseInt(s.slice(3, 5), 16),
      b: parseInt(s.slice(5, 7), 16)
    };
  }
  if (s.length === 4) {
    return {
      r: parseInt(s[1], 16) * 17,
      g: parseInt(s[2], 16) * 17,
      b: parseInt(s[3], 16) * 17
    };
  }
  return null;
}
function isAnsiIndexed(c) {
  return c.r === -1 && c.g === -1;
}
function fgSequence(c) {
  if (isAnsiIndexed(c)) {
    const idx = c.b;
    if (idx < 8) return `\x1B[${30 + idx}m`;
    if (idx < 16) return `\x1B[${90 + idx - 8}m`;
    return `\x1B[38;5;${idx}m`;
  }
  return `\x1B[38;2;${c.r};${c.g};${c.b}m`;
}
function bgSequence(c) {
  if (isAnsiIndexed(c)) {
    const idx = c.b;
    if (idx < 8) return `\x1B[${40 + idx}m`;
    if (idx < 16) return `\x1B[${100 + idx - 8}m`;
    return `\x1B[48;5;${idx}m`;
  }
  return `\x1B[48;2;${c.r};${c.g};${c.b}m`;
}
var RESET = "\x1B[0m";

// src/size.ts
function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, "").replace(/\x1b\]8;[^;]*;[^\x1b]*\x1b\\/g, "");
}
function stringWidth(str) {
  const clean = stripAnsi(str);
  let width2 = 0;
  for (const ch of clean) {
    const code = ch.codePointAt(0);
    width2 += isWide(code) ? 2 : isZeroWidth(code) ? 0 : 1;
  }
  return width2;
}
function isWide(cp) {
  return cp >= 4352 && cp <= 4447 || // Hangul Jamo
  cp >= 11904 && cp <= 12350 || // CJK Radicals
  cp >= 12352 && cp <= 13247 || // Hiragana, Katakana, CJK Compat
  cp >= 13312 && cp <= 19903 || // CJK Unified Ext A
  cp >= 19968 && cp <= 42191 || // CJK Unified + Yi
  cp >= 43360 && cp <= 43388 || // Hangul Jamo Extended-A
  cp >= 44032 && cp <= 55203 || // Hangul Syllables
  cp >= 63744 && cp <= 64255 || // CJK Compat Ideographs
  cp >= 65040 && cp <= 65131 || // CJK Compat Forms, Small Forms
  cp >= 65281 && cp <= 65376 || // Fullwidth Forms
  cp >= 65504 && cp <= 65510 || // Fullwidth Signs
  cp >= 127744 && cp <= 129535 || // Misc Symbols & Emoji
  cp >= 131072 && cp <= 196605 || // CJK Unified Ext B+
  cp >= 196608 && cp <= 262141;
}
function isZeroWidth(cp) {
  return cp >= 8203 && cp <= 8207 || // Zero-width chars
  cp >= 8232 && cp <= 8238 || // Line/paragraph separators, bidi
  cp >= 8288 && cp <= 8292 || // Invisible operators
  cp >= 65024 && cp <= 65039 || // Variation selectors
  cp >= 917760 && cp <= 917999 || // Variation selectors supplement
  cp === 65279;
}
function width(str) {
  let maxW = 0;
  for (const line of str.split("\n")) {
    const w = stringWidth(line);
    if (w > maxW) maxW = w;
  }
  return maxW;
}
function height(str) {
  return str.split("\n").length;
}
function getLines(s) {
  s = s.replace(/\t/g, "    ").replace(/\r\n/g, "\n");
  const lines = s.split("\n");
  let widest = 0;
  for (const l of lines) {
    const w = stringWidth(l);
    if (w > widest) widest = w;
  }
  return [lines, widest];
}

// src/style.ts
function buildStyle(opts) {
  const parts = [];
  if (opts.bold) parts.push("\x1B[1m");
  if (opts.faint) parts.push("\x1B[2m");
  if (opts.italic) parts.push("\x1B[3m");
  if (opts.underline) parts.push("\x1B[4m");
  if (opts.blink) parts.push("\x1B[5m");
  if (opts.reverse) parts.push("\x1B[7m");
  if (opts.strikethrough) parts.push("\x1B[9m");
  if (opts.fg) parts.push(fgSequence(opts.fg));
  if (opts.bg) parts.push(bgSequence(opts.bg));
  return parts.join("");
}
function applyStyleToStr(style, str) {
  if (!style) return str;
  return style + str + RESET;
}
function whichSides(values) {
  switch (values.length) {
    case 1:
      return [values[0], values[0], values[0], values[0]];
    case 2:
      return [values[0], values[1], values[0], values[1]];
    case 3:
      return [values[0], values[1], values[2], values[1]];
    case 4:
      return [values[0], values[1], values[2], values[3]];
    default:
      return null;
  }
}
function wordWrap(str, width2) {
  if (width2 <= 0) return str;
  const lines = str.split("\n");
  const result = [];
  for (const line of lines) {
    if (stringWidth(line) <= width2) {
      result.push(line);
      continue;
    }
    let current = "";
    let currentWidth = 0;
    let i = 0;
    const raw = line;
    while (i < raw.length) {
      if (raw[i] === "\x1B" && raw[i + 1] === "[") {
        let j = i + 2;
        while (j < raw.length && raw[j] !== "m") j++;
        current += raw.slice(i, j + 1);
        i = j + 1;
        continue;
      }
      if (raw[i] === "\x1B" && raw[i + 1] === "]") {
        let j = i + 2;
        while (j < raw.length && !(raw[j] === "\x1B" && raw[j + 1] === "\\")) j++;
        current += raw.slice(i, j + 2);
        i = j + 2;
        continue;
      }
      const ch = raw[i];
      const cp = ch.codePointAt(0);
      const charW = isWideChar(cp) ? 2 : 1;
      if (currentWidth + charW > width2) {
        result.push(current);
        current = "";
        currentWidth = 0;
      }
      current += ch;
      currentWidth += charW;
      i += ch.length;
    }
    if (current) result.push(current);
  }
  return result.join("\n");
}
function isWideChar(cp) {
  return cp >= 4352 && cp <= 4447 || cp >= 11904 && cp <= 12350 || cp >= 12352 && cp <= 13247 || cp >= 13312 && cp <= 19903 || cp >= 19968 && cp <= 42191 || cp >= 44032 && cp <= 55203 || cp >= 63744 && cp <= 64255 || cp >= 65281 && cp <= 65376 || cp >= 127744 && cp <= 129535 || cp >= 131072 && cp <= 196605;
}
function padLines(str, n, style, char, side) {
  if (n <= 0) return str;
  const pad = char.repeat(n);
  const styledPad = style ? applyStyleToStr(style, pad) : pad;
  return str.split("\n").map(
    (line) => side === "left" ? styledPad + line : line + styledPad
  ).join("\n");
}
function alignTextHorizontal(str, pos, w, wsStyle) {
  const [lines, widestLine] = getLines(str);
  const result = [];
  for (const l of lines) {
    const lineWidth = stringWidth(l);
    let shortAmount = widestLine - lineWidth;
    shortAmount += Math.max(0, w - (shortAmount + lineWidth));
    if (shortAmount > 0) {
      if (pos === Right || pos === 1) {
        const s = " ".repeat(shortAmount);
        result.push((wsStyle ? applyStyleToStr(wsStyle, s) : s) + l);
      } else if (pos === Center || pos === 0.5) {
        const left = Math.floor(shortAmount / 2);
        const right = shortAmount - left;
        const ls = " ".repeat(left);
        const rs = " ".repeat(right);
        result.push(
          (wsStyle ? applyStyleToStr(wsStyle, ls) : ls) + l + (wsStyle ? applyStyleToStr(wsStyle, rs) : rs)
        );
      } else {
        const s = " ".repeat(shortAmount);
        result.push(l + (wsStyle ? applyStyleToStr(wsStyle, s) : s));
      }
    } else {
      result.push(l);
    }
  }
  return result.join("\n");
}
function alignTextVertical(str, pos, h) {
  const strHeight = str.split("\n").length;
  if (h <= strHeight) return str;
  const gap = h - strHeight;
  if (pos === Top || pos === 0) {
    return str + "\n".repeat(gap);
  } else if (pos === Bottom || pos === 1) {
    return "\n".repeat(gap) + str;
  } else {
    let topPad = Math.floor(gap / 2);
    let bottomPad = Math.floor(gap / 2);
    if (strHeight + topPad + bottomPad > h) topPad--;
    else if (strHeight + topPad + bottomPad < h) bottomPad++;
    return "\n".repeat(topPad) + str + "\n".repeat(bottomPad);
  }
}
function renderHorizontalEdge(left, middle, right, w) {
  if (!middle) middle = " ";
  const leftW = stringWidth(left);
  const rightW = stringWidth(right);
  const runes = [...middle];
  let out = left;
  let j = 0;
  for (let i = 0; i < w - leftW - rightW; ) {
    const r = runes[j % runes.length];
    out += r;
    i += stringWidth(r);
    j++;
  }
  out += right;
  return out;
}
var Style = class _Style {
  // Text attributes
  _bold = false;
  _italic = false;
  _underline = false;
  _strikethrough = false;
  _reverse = false;
  _blink = false;
  _faint = false;
  // Colors (parsed)
  _fg = null;
  _bg = null;
  // Dimensions
  _width = 0;
  _height = 0;
  _maxWidth = 0;
  _maxHeight = 0;
  // Alignment
  _alignH = Left;
  _alignV = Top;
  // Padding
  _paddingTop = 0;
  _paddingRight = 0;
  _paddingBottom = 0;
  _paddingLeft = 0;
  // Margin
  _marginTop = 0;
  _marginRight = 0;
  _marginBottom = 0;
  _marginLeft = 0;
  _marginBg = null;
  // Border
  _borderStyle = noBorder;
  _borderTop = false;
  _borderRight = false;
  _borderBottom = false;
  _borderLeft = false;
  _borderTopFg = null;
  _borderRightFg = null;
  _borderBottomFg = null;
  _borderLeftFg = null;
  _borderTopBg = null;
  _borderRightBg = null;
  _borderBottomBg = null;
  _borderLeftBg = null;
  // Track which sides were explicitly set
  _borderSidesSet = false;
  _borderStyleSet = false;
  // Inline mode
  _inline = false;
  // Tab width
  _tabWidth = 4;
  // Transform
  _transform = null;
  // Stored value for stringer
  _value = "";
  // Track if any props set
  _hasProps = false;
  // Color whitespace
  _colorWhitespace = true;
  // ─── Chainable setters ───
  /** Enable/disable bold text. */
  bold(v = true) {
    const s = this._clone();
    s._bold = v;
    s._hasProps = true;
    return s;
  }
  italic(v = true) {
    const s = this._clone();
    s._italic = v;
    s._hasProps = true;
    return s;
  }
  underline(v = true) {
    const s = this._clone();
    s._underline = v;
    s._hasProps = true;
    return s;
  }
  strikethrough(v = true) {
    const s = this._clone();
    s._strikethrough = v;
    s._hasProps = true;
    return s;
  }
  reverse(v = true) {
    const s = this._clone();
    s._reverse = v;
    s._hasProps = true;
    return s;
  }
  blink(v = true) {
    const s = this._clone();
    s._blink = v;
    s._hasProps = true;
    return s;
  }
  faint(v = true) {
    const s = this._clone();
    s._faint = v;
    s._hasProps = true;
    return s;
  }
  /** Set foreground color. Accepts hex (`'#FF6B6B'`), ANSI index (`196`), or `{r,g,b}`. */
  foreground(c) {
    const s = this._clone();
    s._fg = parseColor(c);
    s._hasProps = true;
    return s;
  }
  /** Set background color. Accepts hex (`'#FF6B6B'`), ANSI index (`196`), or `{r,g,b}`. */
  background(c) {
    const s = this._clone();
    s._bg = parseColor(c);
    s._hasProps = true;
    return s;
  }
  /** Set fixed width (includes border). Content is wrapped/padded to fit. */
  width(w) {
    const s = this._clone();
    s._width = Math.max(0, w);
    s._hasProps = true;
    return s;
  }
  /** Set fixed height (includes border). Content is aligned vertically to fit. */
  height(h) {
    const s = this._clone();
    s._height = Math.max(0, h);
    s._hasProps = true;
    return s;
  }
  /** Set maximum width. Output is truncated if wider. */
  maxWidth(w) {
    const s = this._clone();
    s._maxWidth = Math.max(0, w);
    s._hasProps = true;
    return s;
  }
  /** Set maximum height. Output is truncated if taller. */
  maxHeight(h) {
    const s = this._clone();
    s._maxHeight = Math.max(0, h);
    s._hasProps = true;
    return s;
  }
  align(...pos) {
    const s = this._clone();
    if (pos.length > 0) s._alignH = pos[0];
    if (pos.length > 1) s._alignV = pos[1];
    s._hasProps = true;
    return s;
  }
  alignHorizontal(p) {
    const s = this._clone();
    s._alignH = p;
    s._hasProps = true;
    return s;
  }
  alignVertical(p) {
    const s = this._clone();
    s._alignV = p;
    s._hasProps = true;
    return s;
  }
  /** Set padding (CSS shorthand: 1-4 values for top/right/bottom/left). */
  padding(...values) {
    const sides = whichSides(values);
    if (!sides) return this;
    const s = this._clone();
    [s._paddingTop, s._paddingRight, s._paddingBottom, s._paddingLeft] = sides.map((v) => Math.max(0, v));
    s._hasProps = true;
    return s;
  }
  paddingTop(v) {
    const s = this._clone();
    s._paddingTop = Math.max(0, v);
    s._hasProps = true;
    return s;
  }
  paddingRight(v) {
    const s = this._clone();
    s._paddingRight = Math.max(0, v);
    s._hasProps = true;
    return s;
  }
  paddingBottom(v) {
    const s = this._clone();
    s._paddingBottom = Math.max(0, v);
    s._hasProps = true;
    return s;
  }
  paddingLeft(v) {
    const s = this._clone();
    s._paddingLeft = Math.max(0, v);
    s._hasProps = true;
    return s;
  }
  /** Set margin (CSS shorthand: 1-4 values for top/right/bottom/left). */
  margin(...values) {
    const sides = whichSides(values);
    if (!sides) return this;
    const s = this._clone();
    [s._marginTop, s._marginRight, s._marginBottom, s._marginLeft] = sides.map((v) => Math.max(0, v));
    s._hasProps = true;
    return s;
  }
  marginTop(v) {
    const s = this._clone();
    s._marginTop = Math.max(0, v);
    s._hasProps = true;
    return s;
  }
  marginRight(v) {
    const s = this._clone();
    s._marginRight = Math.max(0, v);
    s._hasProps = true;
    return s;
  }
  marginBottom(v) {
    const s = this._clone();
    s._marginBottom = Math.max(0, v);
    s._hasProps = true;
    return s;
  }
  marginLeft(v) {
    const s = this._clone();
    s._marginLeft = Math.max(0, v);
    s._hasProps = true;
    return s;
  }
  marginBackground(c) {
    const s = this._clone();
    s._marginBg = parseColor(c);
    s._hasProps = true;
    return s;
  }
  /**
   * Set border style and optionally which sides to draw.
   *
   * Accepts a `Border` object or a string name: `'normal'`, `'rounded'`,
   * `'double'`, `'thick'`, `'hidden'`, `'block'`, `'ascii'`, `'none'`.
   * border(style) - set style, all sides on by default
   * border(style, top, right, bottom, left) - CSS-like sides
   * border('rounded') - use string name
   */
  border(b, ...sides) {
    const s = this._clone();
    s._borderStyle = typeof b === "string" ? getBorderByName(b) : b;
    s._borderStyleSet = true;
    s._hasProps = true;
    const sideValues = whichSides(sides);
    if (sideValues) {
      [s._borderTop, s._borderRight, s._borderBottom, s._borderLeft] = sideValues;
      s._borderSidesSet = true;
    }
    return s;
  }
  borderStyle(b) {
    const s = this._clone();
    s._borderStyle = typeof b === "string" ? getBorderByName(b) : b;
    s._borderStyleSet = true;
    s._hasProps = true;
    return s;
  }
  borderTop(v) {
    const s = this._clone();
    s._borderTop = v;
    s._borderSidesSet = true;
    s._hasProps = true;
    return s;
  }
  borderRight(v) {
    const s = this._clone();
    s._borderRight = v;
    s._borderSidesSet = true;
    s._hasProps = true;
    return s;
  }
  borderBottom(v) {
    const s = this._clone();
    s._borderBottom = v;
    s._borderSidesSet = true;
    s._hasProps = true;
    return s;
  }
  borderLeft(v) {
    const s = this._clone();
    s._borderLeft = v;
    s._borderSidesSet = true;
    s._hasProps = true;
    return s;
  }
  borderForeground(...colors) {
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
  borderBackground(...colors) {
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
  inline(v = true) {
    const s = this._clone();
    s._inline = v;
    s._hasProps = true;
    return s;
  }
  tabWidth(n) {
    const s = this._clone();
    s._tabWidth = n <= -1 ? -1 : n;
    s._hasProps = true;
    return s;
  }
  colorWhitespace(v) {
    const s = this._clone();
    s._colorWhitespace = v;
    s._hasProps = true;
    return s;
  }
  transform(fn) {
    const s = this._clone();
    s._transform = fn;
    s._hasProps = true;
    return s;
  }
  setValue(str) {
    const s = this._clone();
    s._value = str;
    return s;
  }
  // ─── Getters ───
  getBold() {
    return this._bold;
  }
  getItalic() {
    return this._italic;
  }
  getUnderline() {
    return this._underline;
  }
  getStrikethrough() {
    return this._strikethrough;
  }
  getReverse() {
    return this._reverse;
  }
  getBlink() {
    return this._blink;
  }
  getFaint() {
    return this._faint;
  }
  getForeground() {
    return this._fg ? null : null;
  }
  // simplified
  getBackground() {
    return this._bg ? null : null;
  }
  getWidth() {
    return this._width;
  }
  getHeight() {
    return this._height;
  }
  getMaxWidth() {
    return this._maxWidth;
  }
  getMaxHeight() {
    return this._maxHeight;
  }
  getAlign() {
    return this._alignH;
  }
  getAlignHorizontal() {
    return this._alignH;
  }
  getAlignVertical() {
    return this._alignV;
  }
  getPaddingTop() {
    return this._paddingTop;
  }
  getPaddingRight() {
    return this._paddingRight;
  }
  getPaddingBottom() {
    return this._paddingBottom;
  }
  getPaddingLeft() {
    return this._paddingLeft;
  }
  getHorizontalPadding() {
    return this._paddingLeft + this._paddingRight;
  }
  getVerticalPadding() {
    return this._paddingTop + this._paddingBottom;
  }
  getMarginTop() {
    return this._marginTop;
  }
  getMarginRight() {
    return this._marginRight;
  }
  getMarginBottom() {
    return this._marginBottom;
  }
  getMarginLeft() {
    return this._marginLeft;
  }
  getHorizontalMargins() {
    return this._marginLeft + this._marginRight;
  }
  getVerticalMargins() {
    return this._marginTop + this._marginBottom;
  }
  getInline() {
    return this._inline;
  }
  getTabWidth() {
    return this._tabWidth;
  }
  getBorderStyle() {
    return this._borderStyle;
  }
  getBorderTop() {
    return this._shouldRenderBorderSide("top");
  }
  getBorderRight() {
    return this._shouldRenderBorderSide("right");
  }
  getBorderBottom() {
    return this._shouldRenderBorderSide("bottom");
  }
  getBorderLeft() {
    return this._shouldRenderBorderSide("left");
  }
  getHorizontalBorderSize() {
    return (this._shouldRenderBorderSide("left") ? 1 : 0) + (this._shouldRenderBorderSide("right") ? 1 : 0);
  }
  getVerticalBorderSize() {
    return (this._shouldRenderBorderSide("top") ? 1 : 0) + (this._shouldRenderBorderSide("bottom") ? 1 : 0);
  }
  getHorizontalFrameSize() {
    return this.getHorizontalMargins() + this.getHorizontalPadding() + this.getHorizontalBorderSize();
  }
  getVerticalFrameSize() {
    return this.getVerticalMargins() + this.getVerticalPadding() + this.getVerticalBorderSize();
  }
  getFrameSize() {
    return [this.getHorizontalFrameSize(), this.getVerticalFrameSize()];
  }
  // ─── Rendering ───
  /**
   * Render one or more strings with this style applied.
   * Multiple strings are joined with spaces.
   */
  render(...strs) {
    const parts = this._value ? [this._value, ...strs] : strs;
    let str = parts.join(" ");
    if (this._transform) {
      str = this._transform(str);
    }
    if (!this._hasProps) {
      return this._maybeConvertTabs(str);
    }
    const styleSeq = buildStyle({
      bold: this._bold,
      italic: this._italic,
      underline: this._underline,
      strikethrough: this._strikethrough,
      reverse: this._reverse,
      blink: this._blink,
      faint: this._faint,
      fg: this._fg,
      bg: this._bg
    });
    const wsStyle = buildStyle({
      reverse: this._reverse,
      bg: this._colorWhitespace ? this._bg : null
    });
    str = this._maybeConvertTabs(str);
    str = str.replace(/\r\n/g, "\n");
    if (this._inline) {
      str = str.replace(/\n/g, "");
    }
    const hasTop = this._shouldRenderBorderSide("top");
    const hasRight = this._shouldRenderBorderSide("right");
    const hasBottom = this._shouldRenderBorderSide("bottom");
    const hasLeft = this._shouldRenderBorderSide("left");
    const hBorderSize = (hasLeft ? 1 : 0) + (hasRight ? 1 : 0);
    const vBorderSize = (hasTop ? 1 : 0) + (hasBottom ? 1 : 0);
    let w = this._width - hBorderSize;
    let h = this._height - vBorderSize;
    if (!this._inline && w > 0) {
      const wrapAt = w - this._paddingLeft - this._paddingRight;
      str = wordWrap(str, wrapAt);
    }
    if (styleSeq) {
      str = str.split("\n").map((line) => applyStyleToStr(styleSeq, line)).join("\n");
    }
    if (!this._inline) {
      if (this._paddingLeft > 0) {
        str = padLines(str, this._paddingLeft, wsStyle, " ", "left");
      }
      if (this._paddingRight > 0) {
        str = padLines(str, this._paddingRight, wsStyle, " ", "right");
      }
      if (this._paddingTop > 0) {
        str = "\n".repeat(this._paddingTop) + str;
      }
      if (this._paddingBottom > 0) {
        str += "\n".repeat(this._paddingBottom);
      }
    }
    if (h > 0) {
      str = alignTextVertical(str, this._alignV, h);
    }
    {
      const numLines = (str.match(/\n/g) || []).length;
      if (numLines > 0 || w > 0) {
        str = alignTextHorizontal(str, this._alignH, Math.max(0, w), wsStyle);
      }
    }
    if (!this._inline) {
      str = this._applyBorder(str);
      str = this._applyMargins(str);
    }
    if (this._maxWidth > 0) {
      str = str.split("\n").map((line) => truncateToWidth(line, this._maxWidth)).join("\n");
    }
    if (this._maxHeight > 0) {
      const lines = str.split("\n");
      if (lines.length > this._maxHeight) {
        str = lines.slice(0, this._maxHeight).join("\n");
      }
    }
    return str;
  }
  toString() {
    return this.render();
  }
  // ─── Internal ───
  _clone() {
    const s = new _Style();
    Object.assign(s, this);
    return s;
  }
  _shouldRenderBorderSide(side) {
    if (this._borderStyleSet && !this._borderSidesSet && !isNoBorder(this._borderStyle)) {
      return true;
    }
    switch (side) {
      case "top":
        return this._borderTop;
      case "right":
        return this._borderRight;
      case "bottom":
        return this._borderBottom;
      case "left":
        return this._borderLeft;
      default:
        return false;
    }
  }
  _maybeConvertTabs(str) {
    if (this._tabWidth === -1) return str;
    if (this._tabWidth === 0) return str.replace(/\t/g, "");
    return str.replace(/\t/g, " ".repeat(this._tabWidth));
  }
  _styleBorder(border, fg, bg) {
    if (!fg && !bg) return border;
    let seq = "";
    if (fg) seq += fgSequence(fg);
    if (bg) seq += bgSequence(bg);
    return seq + border + RESET;
  }
  _applyBorder(str) {
    const border = { ...this._borderStyle };
    const hasTop = this._shouldRenderBorderSide("top");
    const hasRight = this._shouldRenderBorderSide("right");
    const hasBottom = this._shouldRenderBorderSide("bottom");
    const hasLeft = this._shouldRenderBorderSide("left");
    if (isNoBorder(border) || !hasTop && !hasRight && !hasBottom && !hasLeft) {
      return str;
    }
    const [lines, w] = getLines(str);
    let totalWidth = w;
    if (hasLeft) {
      if (!border.left) border.left = " ";
      totalWidth += stringWidth(border.left);
    }
    if (hasRight) {
      if (!border.right) border.right = " ";
      totalWidth += stringWidth(border.right);
    }
    if (hasTop && hasLeft && !border.topLeft) border.topLeft = " ";
    if (hasTop && hasRight && !border.topRight) border.topRight = " ";
    if (hasBottom && hasLeft && !border.bottomLeft) border.bottomLeft = " ";
    if (hasBottom && hasRight && !border.bottomRight) border.bottomRight = " ";
    if (hasTop && !hasLeft) border.topLeft = "";
    if (hasTop && !hasRight) border.topRight = "";
    if (hasBottom && !hasLeft) border.bottomLeft = "";
    if (hasBottom && !hasRight) border.bottomRight = "";
    let out = "";
    if (hasTop) {
      const top = renderHorizontalEdge(border.topLeft, border.top, border.topRight, totalWidth);
      out += this._styleBorder(top, this._borderTopFg, this._borderTopBg) + "\n";
    }
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
      if (i < lines.length - 1) out += "\n";
    }
    if (hasBottom) {
      const bottom = renderHorizontalEdge(border.bottomLeft, border.bottom, border.bottomRight, totalWidth);
      out += "\n" + this._styleBorder(bottom, this._borderBottomFg, this._borderBottomBg);
    }
    return out;
  }
  _applyMargins(str) {
    const marginStyle = this._marginBg ? bgSequence(this._marginBg) : "";
    const marginReset = this._marginBg ? RESET : "";
    if (this._marginLeft > 0) {
      const pad = " ".repeat(this._marginLeft);
      const styledPad = marginStyle ? marginStyle + pad + marginReset : pad;
      str = str.split("\n").map((line) => styledPad + line).join("\n");
    }
    if (this._marginRight > 0) {
      const pad = " ".repeat(this._marginRight);
      const styledPad = marginStyle ? marginStyle + pad + marginReset : pad;
      str = str.split("\n").map((line) => line + styledPad).join("\n");
    }
    if (this._marginTop > 0) {
      const [, w] = getLines(str);
      const emptyLine = " ".repeat(w);
      const styled = marginStyle ? marginStyle + emptyLine + marginReset : emptyLine;
      str = (styled + "\n").repeat(this._marginTop) + str;
    }
    if (this._marginBottom > 0) {
      const [, w] = getLines(str);
      const emptyLine = " ".repeat(w);
      const styled = marginStyle ? marginStyle + emptyLine + marginReset : emptyLine;
      str += ("\n" + styled).repeat(this._marginBottom);
    }
    return str;
  }
};
function truncateToWidth(str, maxW) {
  let visW = 0;
  let result = "";
  let i = 0;
  while (i < str.length) {
    if (str[i] === "\x1B" && str[i + 1] === "[") {
      let j = i + 2;
      while (j < str.length && str[j] !== "m") j++;
      result += str.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    const ch = str[i];
    const cp = ch.codePointAt(0);
    const charW = isWideChar(cp) ? 2 : 1;
    if (visW + charW > maxW) break;
    result += ch;
    visW += charW;
    i += ch.length;
  }
  if (result.includes("\x1B[") && !result.endsWith(RESET)) {
    result += RESET;
  }
  return result;
}
function NewStyle() {
  return new Style();
}

// src/layout.ts
function JoinHorizontal(pos, ...strs) {
  if (strs.length === 0) return "";
  if (strs.length === 1) return strs[0];
  const blocks = [];
  const maxWidths = [];
  let maxHeight = 0;
  for (const str of strs) {
    const [lines, w] = getLines(str);
    blocks.push(lines);
    maxWidths.push(w);
    if (lines.length > maxHeight) maxHeight = lines.length;
  }
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].length >= maxHeight) continue;
    const extra = maxHeight - blocks[i].length;
    const empties = Array(extra).fill("");
    if (pos === Top || pos === 0) {
      blocks[i] = [...blocks[i], ...empties];
    } else if (pos === Bottom || pos === 1) {
      blocks[i] = [...empties, ...blocks[i]];
    } else {
      const split = Math.round(extra * clampPosition(pos));
      const top = extra - split;
      blocks[i] = [
        ...empties.slice(0, top),
        ...blocks[i],
        ...empties.slice(0, extra - top)
      ];
    }
  }
  const result = [];
  for (let i = 0; i < maxHeight; i++) {
    let line = "";
    for (let j = 0; j < blocks.length; j++) {
      const blockLine = blocks[j][i] || "";
      line += blockLine;
      line += " ".repeat(Math.max(0, maxWidths[j] - stringWidth(blockLine)));
    }
    result.push(line);
  }
  return result.join("\n");
}
function JoinVertical(pos, ...strs) {
  if (strs.length === 0) return "";
  if (strs.length === 1) return strs[0];
  const blocks = [];
  let maxWidth = 0;
  for (const str of strs) {
    const [lines, w] = getLines(str);
    blocks.push(lines);
    if (w > maxWidth) maxWidth = w;
  }
  const result = [];
  for (const block of blocks) {
    for (const line of block) {
      const w = maxWidth - stringWidth(line);
      if (pos === Left || pos === 0) {
        result.push(line + " ".repeat(w));
      } else if (pos === Right || pos === 1) {
        result.push(" ".repeat(w) + line);
      } else {
        if (w < 1) {
          result.push(line);
        } else {
          const split = Math.round(w * clampPosition(pos));
          const right = w - split;
          const left = w - right;
          result.push(" ".repeat(left) + line + " ".repeat(right));
        }
      }
    }
  }
  return result.join("\n");
}

// src/mcp.ts
var tools = [
  {
    name: "style_render",
    description: "Render styled text with lipgloss. Supports colors, bold, italic, underline, borders, padding, margin, alignment, width constraints.",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "Text to render" },
        bold: { type: "boolean" },
        italic: { type: "boolean" },
        underline: { type: "boolean" },
        strikethrough: { type: "boolean" },
        faint: { type: "boolean" },
        foreground: { type: "string", description: "Foreground color (hex or ANSI number)" },
        background: { type: "string", description: "Background color" },
        width: { type: "number" },
        height: { type: "number" },
        align: { type: "string", enum: ["left", "center", "right"] },
        padding: { type: "array", items: { type: "number" }, description: "Padding [all] or [v,h] or [t,r,b,l]" },
        margin: { type: "array", items: { type: "number" }, description: "Margin [all] or [v,h] or [t,r,b,l]" },
        border: { type: "string", enum: ["normal", "rounded", "double", "thick", "hidden", "block", "ascii", "none"] },
        borderForeground: { type: "string" }
      },
      required: ["text"]
    }
  },
  {
    name: "join_horizontal",
    description: "Join multiple styled text blocks horizontally",
    inputSchema: {
      type: "object",
      properties: {
        position: { type: "string", enum: ["top", "center", "bottom"], default: "top" },
        blocks: { type: "array", items: { type: "string" }, description: "Text blocks to join" }
      },
      required: ["blocks"]
    }
  },
  {
    name: "join_vertical",
    description: "Join multiple styled text blocks vertically",
    inputSchema: {
      type: "object",
      properties: {
        position: { type: "string", enum: ["left", "center", "right"], default: "left" },
        blocks: { type: "array", items: { type: "string" }, description: "Text blocks to join" }
      },
      required: ["blocks"]
    }
  },
  {
    name: "measure",
    description: "Measure the width and height of a text block",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string" }
      },
      required: ["text"]
    }
  }
];
function posFromString(s) {
  switch (s) {
    case "center":
      return 0.5;
    case "right":
    case "bottom":
      return 1;
    default:
      return 0;
  }
}
function handleRequest(req) {
  const { method, params, id } = req;
  if (method === "initialize") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "@indiekit/lipgloss", version: "0.1.0" }
      }
    };
  }
  if (method === "notifications/initialized") {
    return { jsonrpc: "2.0", id, result: {} };
  }
  if (method === "tools/list") {
    return { jsonrpc: "2.0", id, result: { tools } };
  }
  if (method === "tools/call") {
    const toolName = params?.name;
    const args = params?.arguments || {};
    try {
      let result;
      switch (toolName) {
        case "style_render": {
          let s = NewStyle();
          if (args.bold) s = s.bold();
          if (args.italic) s = s.italic();
          if (args.underline) s = s.underline();
          if (args.strikethrough) s = s.strikethrough();
          if (args.faint) s = s.faint();
          if (args.foreground) s = s.foreground(args.foreground);
          if (args.background) s = s.background(args.background);
          if (args.width) s = s.width(args.width);
          if (args.height) s = s.height(args.height);
          if (args.align) s = s.align(posFromString(args.align));
          if (args.padding) s = s.padding(...args.padding);
          if (args.margin) s = s.margin(...args.margin);
          if (args.border) s = s.border(args.border);
          if (args.borderForeground) s = s.borderForeground(args.borderForeground);
          result = s.render(args.text);
          break;
        }
        case "join_horizontal": {
          result = JoinHorizontal(posFromString(args.position), ...args.blocks || []);
          break;
        }
        case "join_vertical": {
          result = JoinVertical(posFromString(args.position), ...args.blocks || []);
          break;
        }
        case "measure": {
          const w = width(args.text || "");
          const h = height(args.text || "");
          result = JSON.stringify({ width: w, height: h });
          break;
        }
        default:
          return { jsonrpc: "2.0", id, error: { code: -32601, message: `Unknown tool: ${toolName}` } };
      }
      return { jsonrpc: "2.0", id, result: { content: [{ type: "text", text: result }] } };
    } catch (e) {
      return { jsonrpc: "2.0", id, error: { code: -32603, message: e.message } };
    }
  }
  return { jsonrpc: "2.0", id, error: { code: -32601, message: `Unknown method: ${method}` } };
}
var buffer = "";
process.stdin.setEncoding("utf-8");
process.stdin.on("data", (chunk) => {
  buffer += chunk;
  while (true) {
    const headerEnd = buffer.indexOf("\r\n\r\n");
    if (headerEnd === -1) break;
    const header = buffer.slice(0, headerEnd);
    const match = header.match(/Content-Length:\s*(\d+)/i);
    if (!match) {
      buffer = buffer.slice(headerEnd + 4);
      continue;
    }
    const len = parseInt(match[1], 10);
    const bodyStart = headerEnd + 4;
    if (buffer.length < bodyStart + len) break;
    const body = buffer.slice(bodyStart, bodyStart + len);
    buffer = buffer.slice(bodyStart + len);
    try {
      const req = JSON.parse(body);
      const resp = handleRequest(req);
      if (resp && req.id !== void 0) {
        const respBody = JSON.stringify(resp);
        process.stdout.write(`Content-Length: ${Buffer.byteLength(respBody)}\r
\r
${respBody}`);
      }
    } catch {
    }
  }
});
process.stderr.write("@indiekit/lipgloss MCP server started\n");
