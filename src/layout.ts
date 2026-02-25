import { type Position, Top, Bottom, Left, Right, clampPosition } from './types.js';
import { getLines, stringWidth } from './size.js';

/**
 * Horizontally join multi-line strings along a vertical axis.
 * pos: 0 = top, 0.5 = center, 1 = bottom
 */
export function JoinHorizontal(pos: Position, ...strs: string[]): string {
  if (strs.length === 0) return '';
  if (strs.length === 1) return strs[0];

  const blocks: string[][] = [];
  const maxWidths: number[] = [];
  let maxHeight = 0;

  for (const str of strs) {
    const [lines, w] = getLines(str);
    blocks.push(lines);
    maxWidths.push(w);
    if (lines.length > maxHeight) maxHeight = lines.length;
  }

  // Pad blocks to same height
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].length >= maxHeight) continue;
    const extra = maxHeight - blocks[i].length;
    const empties = Array(extra).fill('');

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
        ...empties.slice(0, extra - top),
      ];
    }
  }

  // Merge lines
  const result: string[] = [];
  for (let i = 0; i < maxHeight; i++) {
    let line = '';
    for (let j = 0; j < blocks.length; j++) {
      const blockLine = blocks[j][i] || '';
      line += blockLine;
      line += ' '.repeat(Math.max(0, maxWidths[j] - stringWidth(blockLine)));
    }
    result.push(line);
  }

  return result.join('\n');
}

/**
 * Vertically join multi-line strings along a horizontal axis.
 * pos: 0 = left, 0.5 = center, 1 = right
 */
export function JoinVertical(pos: Position, ...strs: string[]): string {
  if (strs.length === 0) return '';
  if (strs.length === 1) return strs[0];

  const blocks: string[][] = [];
  let maxWidth = 0;

  for (const str of strs) {
    const [lines, w] = getLines(str);
    blocks.push(lines);
    if (w > maxWidth) maxWidth = w;
  }

  const result: string[] = [];
  for (const block of blocks) {
    for (const line of block) {
      const w = maxWidth - stringWidth(line);
      if (pos === Left || pos === 0) {
        result.push(line + ' '.repeat(w));
      } else if (pos === Right || pos === 1) {
        result.push(' '.repeat(w) + line);
      } else {
        if (w < 1) {
          result.push(line);
        } else {
          const split = Math.round(w * clampPosition(pos));
          const right = w - split;
          const left = w - right;
          result.push(' '.repeat(left) + line + ' '.repeat(right));
        }
      }
    }
  }

  return result.join('\n');
}

/**
 * Place a string in a box of given width/height.
 */
export function Place(
  w: number,
  h: number,
  hPos: Position,
  vPos: Position,
  str: string,
): string {
  return PlaceVertical(h, vPos, PlaceHorizontal(w, hPos, str));
}

/**
 * Place a string horizontally in a box of given width.
 */
export function PlaceHorizontal(w: number, pos: Position, str: string): string {
  const [lines, contentWidth] = getLines(str);
  const gap = w - contentWidth;
  if (gap <= 0) return str;

  const result: string[] = [];
  for (const l of lines) {
    const short = Math.max(0, contentWidth - stringWidth(l));
    const totalGap = gap + short;

    if (pos === Left || pos === 0) {
      result.push(l + ' '.repeat(totalGap));
    } else if (pos === Right || pos === 1) {
      result.push(' '.repeat(totalGap) + l);
    } else {
      const split = Math.round(totalGap * clampPosition(pos));
      const left = totalGap - split;
      const right = totalGap - left;
      result.push(' '.repeat(left) + l + ' '.repeat(right));
    }
  }

  return result.join('\n');
}

/**
 * Place a string vertically in a box of given height.
 */
export function PlaceVertical(h: number, pos: Position, str: string): string {
  const contentHeight = str.split('\n').length;
  const gap = h - contentHeight;
  if (gap <= 0) return str;

  const [, w] = getLines(str);
  const emptyLine = ' '.repeat(w);

  if (pos === Top || pos === 0) {
    return str + '\n' + Array(gap).fill(emptyLine).join('\n');
  } else if (pos === Bottom || pos === 1) {
    return Array(gap).fill(emptyLine).join('\n') + '\n' + str;
  } else {
    const split = Math.round(gap * clampPosition(pos));
    const top = gap - split;
    const bottom = gap - top;
    let result = '';
    if (top > 0) result += Array(top).fill(emptyLine).join('\n') + '\n';
    result += str;
    if (bottom > 0) result += '\n' + Array(bottom).fill(emptyLine).join('\n');
    return result;
  }
}
