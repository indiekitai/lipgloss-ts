/**
 * @indiekit/lipgloss - Terminal styling & layout for TypeScript
 *
 * A TypeScript port of charmbracelet/lipgloss with zero dependencies.
 * Provides an immutable, chainable API for styling terminal output
 * with colors, borders, padding, margins, alignment, and layout utilities.
 *
 * @packageDocumentation
 */

export { Style, NewStyle } from './style.js';
export { JoinHorizontal, JoinVertical, Place, PlaceHorizontal, PlaceVertical } from './layout.js';
export { width as Width, height as Height, stringWidth as StringWidth } from './size.js';
export {
  type Border,
  type ColorValue,
  type Position,
  Top,
  Bottom,
  Center,
  Left,
  Right,
} from './types.js';
export {
  normalBorder as NormalBorder,
  roundedBorder as RoundedBorder,
  thickBorder as ThickBorder,
  doubleBorder as DoubleBorder,
  hiddenBorder as HiddenBorder,
  blockBorder as BlockBorder,
  asciiBorder as ASCIIBorder,
  noBorder as NoBorder,
} from './border.js';
