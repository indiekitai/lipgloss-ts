import type { ColorValue } from './types.js';

export interface RGBA {
  r: number;
  g: number;
  b: number;
}

/**
 * Parse a ColorValue into an RGBA object, or null for no color.
 */
export function parseColor(c: ColorValue): RGBA | null {
  if (c === null || c === undefined) return null;

  if (typeof c === 'object' && 'r' in c) {
    return { r: c.r & 0xff, g: c.g & 0xff, b: c.b & 0xff };
  }

  if (typeof c === 'number') {
    if (c < 0) c = -c;
    // Will be handled as ANSI index in sequence generation
    return { r: -1, g: -1, b: c }; // sentinel for ANSI indexed
  }

  if (typeof c === 'string') {
    if (c.startsWith('#')) {
      return parseHex(c);
    }
    // Try as number string
    const n = parseInt(c, 10);
    if (!isNaN(n)) {
      return { r: -1, g: -1, b: n }; // sentinel for ANSI indexed
    }
  }

  return null;
}

function parseHex(s: string): RGBA | null {
  if (s.length === 7) {
    return {
      r: parseInt(s.slice(1, 3), 16),
      g: parseInt(s.slice(3, 5), 16),
      b: parseInt(s.slice(5, 7), 16),
    };
  }
  if (s.length === 4) {
    return {
      r: parseInt(s[1], 16) * 17,
      g: parseInt(s[2], 16) * 17,
      b: parseInt(s[3], 16) * 17,
    };
  }
  return null;
}

/**
 * Check if a parsed color is an ANSI indexed color (sentinel).
 */
export function isAnsiIndexed(c: RGBA): boolean {
  return c.r === -1 && c.g === -1;
}

/**
 * Generate ANSI escape sequence for a foreground color.
 */
export function fgSequence(c: RGBA): string {
  if (isAnsiIndexed(c)) {
    const idx = c.b;
    if (idx < 8) return `\x1b[${30 + idx}m`;
    if (idx < 16) return `\x1b[${90 + idx - 8}m`;
    return `\x1b[38;5;${idx}m`;
  }
  return `\x1b[38;2;${c.r};${c.g};${c.b}m`;
}

/**
 * Generate ANSI escape sequence for a background color.
 */
export function bgSequence(c: RGBA): string {
  if (isAnsiIndexed(c)) {
    const idx = c.b;
    if (idx < 8) return `\x1b[${40 + idx}m`;
    if (idx < 16) return `\x1b[${100 + idx - 8}m`;
    return `\x1b[48;5;${idx}m`;
  }
  return `\x1b[48;2;${c.r};${c.g};${c.b}m`;
}

export const RESET = '\x1b[0m';
