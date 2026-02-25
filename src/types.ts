/**
 * Position along an axis. 0 = start (left/top), 1 = end (right/bottom), 0.5 = center.
 */
export type Position = number;

export const Top: Position = 0.0;
export const Bottom: Position = 1.0;
export const Center: Position = 0.5;
export const Left: Position = 0.0;
export const Right: Position = 1.0;

export function clampPosition(p: Position): number {
  return Math.min(1, Math.max(0, p));
}

/**
 * Border definition - characters for each part of a border.
 */
export interface Border {
  top: string;
  bottom: string;
  left: string;
  right: string;
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
  middleLeft: string;
  middleRight: string;
  middle: string;
  middleTop: string;
  middleBottom: string;
}

/**
 * Color can be a hex string (#RGB or #RRGGBB), ANSI number (0-255),
 * or an RGB object.
 */
export type ColorValue = string | number | { r: number; g: number; b: number } | null;
