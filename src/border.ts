import type { Border } from './types.js';

export const noBorder: Border = {
  top: '', bottom: '', left: '', right: '',
  topLeft: '', topRight: '', bottomLeft: '', bottomRight: '',
  middleLeft: '', middleRight: '', middle: '', middleTop: '', middleBottom: '',
};

export const normalBorder: Border = {
  top: '─', bottom: '─', left: '│', right: '│',
  topLeft: '┌', topRight: '┐', bottomLeft: '└', bottomRight: '┘',
  middleLeft: '├', middleRight: '┤', middle: '┼', middleTop: '┬', middleBottom: '┴',
};

export const roundedBorder: Border = {
  top: '─', bottom: '─', left: '│', right: '│',
  topLeft: '╭', topRight: '╮', bottomLeft: '╰', bottomRight: '╯',
  middleLeft: '├', middleRight: '┤', middle: '┼', middleTop: '┬', middleBottom: '┴',
};

export const thickBorder: Border = {
  top: '━', bottom: '━', left: '┃', right: '┃',
  topLeft: '┏', topRight: '┓', bottomLeft: '┗', bottomRight: '┛',
  middleLeft: '┣', middleRight: '┫', middle: '╋', middleTop: '┳', middleBottom: '┻',
};

export const doubleBorder: Border = {
  top: '═', bottom: '═', left: '║', right: '║',
  topLeft: '╔', topRight: '╗', bottomLeft: '╚', bottomRight: '╝',
  middleLeft: '╠', middleRight: '╣', middle: '╬', middleTop: '╦', middleBottom: '╩',
};

export const hiddenBorder: Border = {
  top: ' ', bottom: ' ', left: ' ', right: ' ',
  topLeft: ' ', topRight: ' ', bottomLeft: ' ', bottomRight: ' ',
  middleLeft: ' ', middleRight: ' ', middle: ' ', middleTop: ' ', middleBottom: ' ',
};

export const blockBorder: Border = {
  top: '█', bottom: '█', left: '█', right: '█',
  topLeft: '█', topRight: '█', bottomLeft: '█', bottomRight: '█',
  middleLeft: '█', middleRight: '█', middle: '█', middleTop: '█', middleBottom: '█',
};

export const asciiBorder: Border = {
  top: '-', bottom: '-', left: '|', right: '|',
  topLeft: '+', topRight: '+', bottomLeft: '+', bottomRight: '+',
  middleLeft: '+', middleRight: '+', middle: '+', middleTop: '+', middleBottom: '+',
};

/**
 * Get a border by name string for convenience API.
 */
export function getBorderByName(name: string): Border {
  switch (name.toLowerCase()) {
    case 'normal': return normalBorder;
    case 'rounded': return roundedBorder;
    case 'thick': return thickBorder;
    case 'double': return doubleBorder;
    case 'hidden': return hiddenBorder;
    case 'block': return blockBorder;
    case 'ascii': return asciiBorder;
    case 'none': return noBorder;
    default: return noBorder;
  }
}

/**
 * Check if a border equals noBorder.
 */
export function isNoBorder(b: Border): boolean {
  return b.top === '' && b.bottom === '' && b.left === '' && b.right === '' &&
    b.topLeft === '' && b.topRight === '' && b.bottomLeft === '' && b.bottomRight === '';
}
