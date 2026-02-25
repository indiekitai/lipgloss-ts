/**
 * Strip ANSI escape sequences from a string.
 */
export function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, '').replace(/\x1b\]8;[^;]*;[^\x1b]*\x1b\\/g, '');
}

/**
 * Get the visible (cell) width of a string, ignoring ANSI escape codes.
 * Handles wide characters (CJK, emoji) as 2-width.
 */
export function stringWidth(str: string): number {
  const clean = stripAnsi(str);
  let width = 0;
  for (const ch of clean) {
    const code = ch.codePointAt(0)!;
    width += isWide(code) ? 2 : isZeroWidth(code) ? 0 : 1;
  }
  return width;
}

/**
 * Check if a code point is a wide (2-cell) character.
 * Covers CJK Unified Ideographs, Hangul, fullwidth forms, and common emoji.
 */
function isWide(cp: number): boolean {
  return (
    (cp >= 0x1100 && cp <= 0x115f) || // Hangul Jamo
    (cp >= 0x2e80 && cp <= 0x303e) || // CJK Radicals
    (cp >= 0x3040 && cp <= 0x33bf) || // Hiragana, Katakana, CJK Compat
    (cp >= 0x3400 && cp <= 0x4dbf) || // CJK Unified Ext A
    (cp >= 0x4e00 && cp <= 0xa4cf) || // CJK Unified + Yi
    (cp >= 0xa960 && cp <= 0xa97c) || // Hangul Jamo Extended-A
    (cp >= 0xac00 && cp <= 0xd7a3) || // Hangul Syllables
    (cp >= 0xf900 && cp <= 0xfaff) || // CJK Compat Ideographs
    (cp >= 0xfe10 && cp <= 0xfe6b) || // CJK Compat Forms, Small Forms
    (cp >= 0xff01 && cp <= 0xff60) || // Fullwidth Forms
    (cp >= 0xffe0 && cp <= 0xffe6) || // Fullwidth Signs
    (cp >= 0x1f300 && cp <= 0x1f9ff) || // Misc Symbols & Emoji
    (cp >= 0x20000 && cp <= 0x2fffd) || // CJK Unified Ext B+
    (cp >= 0x30000 && cp <= 0x3fffd)    // CJK Unified Ext G+
  );
}

function isZeroWidth(cp: number): boolean {
  return (
    (cp >= 0x200b && cp <= 0x200f) || // Zero-width chars
    (cp >= 0x2028 && cp <= 0x202e) || // Line/paragraph separators, bidi
    (cp >= 0x2060 && cp <= 0x2064) || // Invisible operators
    (cp >= 0xfe00 && cp <= 0xfe0f) || // Variation selectors
    (cp >= 0xe0100 && cp <= 0xe01ef) || // Variation selectors supplement
    cp === 0xfeff // BOM/zero-width no-break space
  );
}

/**
 * Width of a string = max line width.
 */
export function width(str: string): number {
  let maxW = 0;
  for (const line of str.split('\n')) {
    const w = stringWidth(line);
    if (w > maxW) maxW = w;
  }
  return maxW;
}

/**
 * Height of a string = number of lines.
 */
export function height(str: string): number {
  return str.split('\n').length;
}

/**
 * Split string into lines, return lines and widest line width.
 */
export function getLines(s: string): [string[], number] {
  s = s.replace(/\t/g, '    ').replace(/\r\n/g, '\n');
  const lines = s.split('\n');
  let widest = 0;
  for (const l of lines) {
    const w = stringWidth(l);
    if (w > widest) widest = w;
  }
  return [lines, widest];
}
