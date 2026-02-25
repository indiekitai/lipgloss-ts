/**
 * Position along an axis. 0 = start (left/top), 1 = end (right/bottom), 0.5 = center.
 */
type Position = number;
declare const Top: Position;
declare const Bottom: Position;
declare const Center: Position;
declare const Left: Position;
declare const Right: Position;
/**
 * Border definition - characters for each part of a border.
 */
interface Border {
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
type ColorValue = string | number | {
    r: number;
    g: number;
    b: number;
} | null;

/**
 * Immutable style builder for terminal output.
 *
 * Every setter returns a new Style instance (immutable/chainable pattern).
 * Call `.render(text)` to produce the final ANSI-styled string.
 *
 * @example
 * ```ts
 * const style = NewStyle()
 *   .bold()
 *   .foreground('#FF6B6B')
 *   .border('rounded')
 *   .padding(1, 2);
 *
 * console.log(style.render('Hello!'));
 * ```
 */
declare class Style {
    private _bold;
    private _italic;
    private _underline;
    private _strikethrough;
    private _reverse;
    private _blink;
    private _faint;
    private _fg;
    private _bg;
    private _width;
    private _height;
    private _maxWidth;
    private _maxHeight;
    private _alignH;
    private _alignV;
    private _paddingTop;
    private _paddingRight;
    private _paddingBottom;
    private _paddingLeft;
    private _marginTop;
    private _marginRight;
    private _marginBottom;
    private _marginLeft;
    private _marginBg;
    private _borderStyle;
    private _borderTop;
    private _borderRight;
    private _borderBottom;
    private _borderLeft;
    private _borderTopFg;
    private _borderRightFg;
    private _borderBottomFg;
    private _borderLeftFg;
    private _borderTopBg;
    private _borderRightBg;
    private _borderBottomBg;
    private _borderLeftBg;
    private _borderSidesSet;
    private _borderStyleSet;
    private _inline;
    private _tabWidth;
    private _transform;
    private _value;
    private _hasProps;
    private _colorWhitespace;
    /** Enable/disable bold text. */
    bold(v?: boolean): Style;
    italic(v?: boolean): Style;
    underline(v?: boolean): Style;
    strikethrough(v?: boolean): Style;
    reverse(v?: boolean): Style;
    blink(v?: boolean): Style;
    faint(v?: boolean): Style;
    /** Set foreground color. Accepts hex (`'#FF6B6B'`), ANSI index (`196`), or `{r,g,b}`. */
    foreground(c: ColorValue): Style;
    /** Set background color. Accepts hex (`'#FF6B6B'`), ANSI index (`196`), or `{r,g,b}`. */
    background(c: ColorValue): Style;
    /** Set fixed width (includes border). Content is wrapped/padded to fit. */
    width(w: number): Style;
    /** Set fixed height (includes border). Content is aligned vertically to fit. */
    height(h: number): Style;
    /** Set maximum width. Output is truncated if wider. */
    maxWidth(w: number): Style;
    /** Set maximum height. Output is truncated if taller. */
    maxHeight(h: number): Style;
    align(...pos: Position[]): Style;
    alignHorizontal(p: Position): Style;
    alignVertical(p: Position): Style;
    /** Set padding (CSS shorthand: 1-4 values for top/right/bottom/left). */
    padding(...values: number[]): Style;
    paddingTop(v: number): Style;
    paddingRight(v: number): Style;
    paddingBottom(v: number): Style;
    paddingLeft(v: number): Style;
    /** Set margin (CSS shorthand: 1-4 values for top/right/bottom/left). */
    margin(...values: number[]): Style;
    marginTop(v: number): Style;
    marginRight(v: number): Style;
    marginBottom(v: number): Style;
    marginLeft(v: number): Style;
    marginBackground(c: ColorValue): Style;
    /**
     * Set border style and optionally which sides to draw.
     *
     * Accepts a `Border` object or a string name: `'normal'`, `'rounded'`,
     * `'double'`, `'thick'`, `'hidden'`, `'block'`, `'ascii'`, `'none'`.
     * border(style) - set style, all sides on by default
     * border(style, top, right, bottom, left) - CSS-like sides
     * border('rounded') - use string name
     */
    border(b: Border | string, ...sides: boolean[]): Style;
    borderStyle(b: Border | string): Style;
    borderTop(v: boolean): Style;
    borderRight(v: boolean): Style;
    borderBottom(v: boolean): Style;
    borderLeft(v: boolean): Style;
    borderForeground(...colors: ColorValue[]): Style;
    borderBackground(...colors: ColorValue[]): Style;
    inline(v?: boolean): Style;
    tabWidth(n: number): Style;
    colorWhitespace(v: boolean): Style;
    transform(fn: (s: string) => string): Style;
    setValue(str: string): Style;
    getBold(): boolean;
    getItalic(): boolean;
    getUnderline(): boolean;
    getStrikethrough(): boolean;
    getReverse(): boolean;
    getBlink(): boolean;
    getFaint(): boolean;
    getForeground(): ColorValue;
    getBackground(): ColorValue;
    getWidth(): number;
    getHeight(): number;
    getMaxWidth(): number;
    getMaxHeight(): number;
    getAlign(): Position;
    getAlignHorizontal(): Position;
    getAlignVertical(): Position;
    getPaddingTop(): number;
    getPaddingRight(): number;
    getPaddingBottom(): number;
    getPaddingLeft(): number;
    getHorizontalPadding(): number;
    getVerticalPadding(): number;
    getMarginTop(): number;
    getMarginRight(): number;
    getMarginBottom(): number;
    getMarginLeft(): number;
    getHorizontalMargins(): number;
    getVerticalMargins(): number;
    getInline(): boolean;
    getTabWidth(): number;
    getBorderStyle(): Border;
    getBorderTop(): boolean;
    getBorderRight(): boolean;
    getBorderBottom(): boolean;
    getBorderLeft(): boolean;
    getHorizontalBorderSize(): number;
    getVerticalBorderSize(): number;
    getHorizontalFrameSize(): number;
    getVerticalFrameSize(): number;
    getFrameSize(): [number, number];
    /**
     * Render one or more strings with this style applied.
     * Multiple strings are joined with spaces.
     */
    render(...strs: string[]): string;
    toString(): string;
    private _clone;
    private _shouldRenderBorderSide;
    private _maybeConvertTabs;
    private _styleBorder;
    private _applyBorder;
    private _applyMargins;
}
/**
 * Create a new empty Style.
 */
declare function NewStyle(): Style;

/**
 * Horizontally join multi-line strings along a vertical axis.
 * pos: 0 = top, 0.5 = center, 1 = bottom
 */
declare function JoinHorizontal(pos: Position, ...strs: string[]): string;
/**
 * Vertically join multi-line strings along a horizontal axis.
 * pos: 0 = left, 0.5 = center, 1 = right
 */
declare function JoinVertical(pos: Position, ...strs: string[]): string;
/**
 * Place a string in a box of given width/height.
 */
declare function Place(w: number, h: number, hPos: Position, vPos: Position, str: string): string;
/**
 * Place a string horizontally in a box of given width.
 */
declare function PlaceHorizontal(w: number, pos: Position, str: string): string;
/**
 * Place a string vertically in a box of given height.
 */
declare function PlaceVertical(h: number, pos: Position, str: string): string;

/**
 * Get the visible (cell) width of a string, ignoring ANSI escape codes.
 * Handles wide characters (CJK, emoji) as 2-width.
 */
declare function stringWidth(str: string): number;
/**
 * Width of a string = max line width.
 */
declare function width(str: string): number;
/**
 * Height of a string = number of lines.
 */
declare function height(str: string): number;

declare const noBorder: Border;
declare const normalBorder: Border;
declare const roundedBorder: Border;
declare const thickBorder: Border;
declare const doubleBorder: Border;
declare const hiddenBorder: Border;
declare const blockBorder: Border;
declare const asciiBorder: Border;

export { asciiBorder as ASCIIBorder, blockBorder as BlockBorder, type Border, Bottom, Center, type ColorValue, doubleBorder as DoubleBorder, height as Height, hiddenBorder as HiddenBorder, JoinHorizontal, JoinVertical, Left, NewStyle, noBorder as NoBorder, normalBorder as NormalBorder, Place, PlaceHorizontal, PlaceVertical, type Position, Right, roundedBorder as RoundedBorder, stringWidth as StringWidth, Style, thickBorder as ThickBorder, Top, width as Width };
