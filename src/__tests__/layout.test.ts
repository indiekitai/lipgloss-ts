import { describe, it, expect } from 'vitest';
import { JoinHorizontal, JoinVertical, Place, PlaceHorizontal, PlaceVertical } from '../layout.js';
import { Top, Bottom, Center, Left, Right } from '../types.js';
import { StringWidth, Width, Height } from '../index.js';

describe('JoinHorizontal', () => {
  it('returns empty for no args', () => {
    expect(JoinHorizontal(Top)).toBe('');
  });

  it('returns single arg unchanged', () => {
    expect(JoinHorizontal(Top, 'hello')).toBe('hello');
  });

  it('joins two blocks side by side', () => {
    const a = 'A1\nA2';
    const b = 'B1\nB2';
    const result = JoinHorizontal(Top, a, b);
    const lines = result.split('\n');
    expect(lines.length).toBe(2);
    expect(lines[0]).toContain('A1');
    expect(lines[0]).toContain('B1');
  });

  it('handles different heights (top aligned)', () => {
    const a = 'A1\nA2\nA3';
    const b = 'B1';
    const result = JoinHorizontal(Top, a, b);
    const lines = result.split('\n');
    expect(lines.length).toBe(3);
    expect(lines[0]).toContain('B1');
  });

  it('handles different heights (bottom aligned)', () => {
    const a = 'A1\nA2\nA3';
    const b = 'B1';
    const result = JoinHorizontal(Bottom, a, b);
    const lines = result.split('\n');
    expect(lines.length).toBe(3);
    expect(lines[2]).toContain('B1');
  });

  it('handles different heights (center aligned)', () => {
    const a = 'A1\nA2\nA3';
    const b = 'B1';
    const result = JoinHorizontal(Center, a, b);
    const lines = result.split('\n');
    expect(lines.length).toBe(3);
    // B1 should be in the middle
    expect(lines[1]).toContain('B1');
  });
});

describe('JoinVertical', () => {
  it('returns empty for no args', () => {
    expect(JoinVertical(Left)).toBe('');
  });

  it('returns single arg unchanged', () => {
    expect(JoinVertical(Left, 'hello')).toBe('hello');
  });

  it('stacks blocks vertically (left aligned)', () => {
    const result = JoinVertical(Left, 'short', 'a longer line');
    const lines = result.split('\n');
    expect(lines.length).toBe(2);
    // All lines should be same width (padded right)
    expect(StringWidth(lines[0])).toBe(StringWidth(lines[1]));
  });

  it('right aligns', () => {
    const result = JoinVertical(Right, 'hi', 'hello');
    const lines = result.split('\n');
    expect(lines[0]).toContain('   hi');
  });

  it('center aligns', () => {
    const result = JoinVertical(Center, 'hi', 'hello');
    const lines = result.split('\n');
    // 'hi' should be centered in 5-wide space
    expect(lines[0].startsWith(' ')).toBe(true);
  });
});

describe('Place', () => {
  it('places text in a box', () => {
    const result = Place(10, 5, Center, Center, 'hi');
    const lines = result.split('\n');
    expect(lines.length).toBe(5);
    expect(StringWidth(lines[0])).toBe(10);
  });
});

describe('PlaceHorizontal', () => {
  it('places left', () => {
    const result = PlaceHorizontal(10, Left, 'hi');
    expect(result).toBe('hi        ');
  });

  it('places right', () => {
    const result = PlaceHorizontal(10, Right, 'hi');
    expect(result).toBe('        hi');
  });

  it('noop if width smaller', () => {
    const result = PlaceHorizontal(2, Left, 'hello');
    expect(result).toBe('hello');
  });
});

describe('PlaceVertical', () => {
  it('places at top', () => {
    const result = PlaceVertical(3, Top, 'hi');
    const lines = result.split('\n');
    expect(lines.length).toBe(3);
    expect(lines[0]).toBe('hi');
  });

  it('places at bottom', () => {
    const result = PlaceVertical(3, Bottom, 'hi');
    const lines = result.split('\n');
    expect(lines.length).toBe(3);
    expect(lines[2]).toBe('hi');
  });
});
