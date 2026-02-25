import { describe, it, expect } from 'vitest';
import { parseColor, fgSequence, bgSequence, isAnsiIndexed } from '../color.js';

describe('parseColor', () => {
  it('returns null for null', () => {
    expect(parseColor(null)).toBeNull();
  });

  it('parses hex #RRGGBB', () => {
    const c = parseColor('#FF8800');
    expect(c).toEqual({ r: 255, g: 136, b: 0 });
  });

  it('parses hex #RGB', () => {
    const c = parseColor('#F80');
    expect(c).toEqual({ r: 255, g: 136, b: 0 });
  });

  it('parses ANSI index number', () => {
    const c = parseColor(196);
    expect(c).not.toBeNull();
    expect(isAnsiIndexed(c!)).toBe(true);
  });

  it('parses RGB object', () => {
    const c = parseColor({ r: 10, g: 20, b: 30 });
    expect(c).toEqual({ r: 10, g: 20, b: 30 });
  });

  it('parses string number', () => {
    const c = parseColor('42');
    expect(c).not.toBeNull();
    expect(isAnsiIndexed(c!)).toBe(true);
  });
});

describe('fgSequence', () => {
  it('true color', () => {
    expect(fgSequence({ r: 255, g: 0, b: 0 })).toBe('\x1b[38;2;255;0;0m');
  });

  it('basic ANSI (0-7)', () => {
    expect(fgSequence({ r: -1, g: -1, b: 1 })).toBe('\x1b[31m');
  });

  it('bright ANSI (8-15)', () => {
    expect(fgSequence({ r: -1, g: -1, b: 9 })).toBe('\x1b[91m');
  });

  it('ANSI 256', () => {
    expect(fgSequence({ r: -1, g: -1, b: 196 })).toBe('\x1b[38;5;196m');
  });
});

describe('bgSequence', () => {
  it('true color', () => {
    expect(bgSequence({ r: 0, g: 255, b: 0 })).toBe('\x1b[48;2;0;255;0m');
  });

  it('basic ANSI', () => {
    expect(bgSequence({ r: -1, g: -1, b: 2 })).toBe('\x1b[42m');
  });
});
