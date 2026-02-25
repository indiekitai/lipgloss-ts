import { describe, it, expect } from 'vitest';
import { getBorderByName, isNoBorder, normalBorder, roundedBorder, doubleBorder, thickBorder, hiddenBorder, noBorder } from '../border.js';

describe('borders', () => {
  it('getBorderByName returns correct borders', () => {
    expect(getBorderByName('normal')).toEqual(normalBorder);
    expect(getBorderByName('rounded')).toEqual(roundedBorder);
    expect(getBorderByName('double')).toEqual(doubleBorder);
    expect(getBorderByName('thick')).toEqual(thickBorder);
    expect(getBorderByName('hidden')).toEqual(hiddenBorder);
    expect(getBorderByName('none')).toEqual(noBorder);
  });

  it('isNoBorder identifies empty border', () => {
    expect(isNoBorder(noBorder)).toBe(true);
    expect(isNoBorder(normalBorder)).toBe(false);
  });

  it('border chars are correct', () => {
    expect(roundedBorder.topLeft).toBe('╭');
    expect(roundedBorder.topRight).toBe('╮');
    expect(roundedBorder.bottomLeft).toBe('╰');
    expect(roundedBorder.bottomRight).toBe('╯');
    expect(doubleBorder.topLeft).toBe('╔');
    expect(thickBorder.topLeft).toBe('┏');
  });
});
