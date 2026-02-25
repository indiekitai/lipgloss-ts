import { describe, it, expect } from 'vitest';
import { stringWidth, width, height, stripAnsi } from '../size.js';

describe('stringWidth', () => {
  it('ascii', () => {
    expect(stringWidth('hello')).toBe(5);
  });

  it('empty', () => {
    expect(stringWidth('')).toBe(0);
  });

  it('strips ANSI', () => {
    expect(stringWidth('\x1b[1mhello\x1b[0m')).toBe(5);
  });

  it('wide chars (CJK)', () => {
    expect(stringWidth('你好')).toBe(4);
  });

  it('emoji', () => {
    // Basic emoji are typically 2-wide
    expect(stringWidth('🎨')).toBe(2);
  });

  it('mixed', () => {
    expect(stringWidth('hi你好')).toBe(6);
  });
});

describe('width', () => {
  it('single line', () => {
    expect(width('hello')).toBe(5);
  });

  it('multi line returns widest', () => {
    expect(width('hi\nhello world\nbye')).toBe(11);
  });
});

describe('height', () => {
  it('single line', () => {
    expect(height('hello')).toBe(1);
  });

  it('multi line', () => {
    expect(height('a\nb\nc')).toBe(3);
  });
});

describe('stripAnsi', () => {
  it('strips SGR', () => {
    expect(stripAnsi('\x1b[1m\x1b[38;2;255;0;0mhello\x1b[0m')).toBe('hello');
  });

  it('no-op on clean string', () => {
    expect(stripAnsi('hello')).toBe('hello');
  });
});
