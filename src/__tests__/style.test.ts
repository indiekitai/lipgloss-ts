import { describe, it, expect } from 'vitest';
import { NewStyle, Width, Height, StringWidth } from '../index.js';
import { stripAnsi } from '../size.js';

describe('Style', () => {
  describe('basic creation', () => {
    it('creates empty style', () => {
      const s = NewStyle();
      expect(s.render('hello')).toBe('hello');
    });

    it('is immutable (returns new instance)', () => {
      const s1 = NewStyle();
      const s2 = s1.bold();
      expect(s1.getBold()).toBe(false);
      expect(s2.getBold()).toBe(true);
    });
  });

  describe('text attributes', () => {
    it('bold', () => {
      const out = NewStyle().bold().render('hi');
      expect(out).toContain('\x1b[1m');
      expect(out).toContain('hi');
      expect(out).toContain('\x1b[0m');
    });

    it('italic', () => {
      const out = NewStyle().italic().render('hi');
      expect(out).toContain('\x1b[3m');
    });

    it('underline', () => {
      const out = NewStyle().underline().render('hi');
      expect(out).toContain('\x1b[4m');
    });

    it('strikethrough', () => {
      const out = NewStyle().strikethrough().render('hi');
      expect(out).toContain('\x1b[9m');
    });

    it('faint', () => {
      const out = NewStyle().faint().render('hi');
      expect(out).toContain('\x1b[2m');
    });

    it('reverse', () => {
      const out = NewStyle().reverse().render('hi');
      expect(out).toContain('\x1b[7m');
    });

    it('blink', () => {
      const out = NewStyle().blink().render('hi');
      expect(out).toContain('\x1b[5m');
    });

    it('combined attributes', () => {
      const out = NewStyle().bold().italic().underline().render('hi');
      expect(out).toContain('\x1b[1m');
      expect(out).toContain('\x1b[3m');
      expect(out).toContain('\x1b[4m');
      expect(stripAnsi(out)).toContain('hi');
    });
  });

  describe('colors', () => {
    it('foreground hex color', () => {
      const out = NewStyle().foreground('#FF0000').render('red');
      expect(out).toContain('\x1b[38;2;255;0;0m');
    });

    it('background hex color', () => {
      const out = NewStyle().background('#00FF00').render('green');
      expect(out).toContain('\x1b[48;2;0;255;0m');
    });

    it('ANSI 256 color', () => {
      const out = NewStyle().foreground(196).render('red');
      expect(out).toContain('\x1b[38;5;196m');
    });

    it('basic ANSI color (0-7)', () => {
      const out = NewStyle().foreground(1).render('red');
      expect(out).toContain('\x1b[31m');
    });

    it('short hex (#RGB)', () => {
      const out = NewStyle().foreground('#F00').render('red');
      expect(out).toContain('\x1b[38;2;255;0;0m');
    });
  });

  describe('padding', () => {
    it('single value padding', () => {
      const out = NewStyle().padding(1).render('hi');
      const lines = out.split('\n');
      expect(lines.length).toBe(3); // top + content + bottom
      expect(stripAnsi(lines[1])).toContain(' hi '); // left and right padding
    });

    it('two value padding (v, h)', () => {
      const out = NewStyle().padding(0, 2).render('hi');
      expect(stripAnsi(out)).toBe('  hi  ');
    });

    it('four value padding', () => {
      const out = NewStyle().padding(1, 2, 1, 3).render('hi');
      const lines = out.split('\n');
      expect(lines.length).toBe(3);
      expect(stripAnsi(lines[1])).toBe('   hi  ');
    });
  });

  describe('margin', () => {
    it('left margin', () => {
      const out = NewStyle().marginLeft(3).render('hi');
      expect(out).toBe('   hi');
    });

    it('right margin', () => {
      const out = NewStyle().marginRight(3).render('hi');
      expect(out).toBe('hi   ');
    });
  });

  describe('width & alignment', () => {
    it('fixed width with left alignment', () => {
      const out = NewStyle().width(10).render('hi');
      expect(stripAnsi(out)).toBe('hi        ');
      expect(StringWidth(out)).toBe(10);
    });

    it('fixed width with center alignment', () => {
      const out = NewStyle().width(10).align(0.5).render('hi');
      expect(stripAnsi(out).length).toBe(10);
    });

    it('fixed width with right alignment', () => {
      const out = NewStyle().width(10).align(1.0).render('hi');
      expect(stripAnsi(out)).toBe('        hi');
    });
  });

  describe('height', () => {
    it('fixed height', () => {
      const out = NewStyle().height(3).render('hi');
      const lines = out.split('\n');
      expect(lines.length).toBe(3);
    });
  });

  describe('borders', () => {
    it('renders rounded border', () => {
      const out = NewStyle().border('rounded').render('hi');
      expect(out).toContain('╭');
      expect(out).toContain('╮');
      expect(out).toContain('╰');
      expect(out).toContain('╯');
      expect(out).toContain('hi');
    });

    it('renders normal border', () => {
      const out = NewStyle().border('normal').render('hi');
      expect(out).toContain('┌');
      expect(out).toContain('┘');
    });

    it('renders double border', () => {
      const out = NewStyle().border('double').render('hi');
      expect(out).toContain('╔');
      expect(out).toContain('╝');
    });

    it('renders thick border', () => {
      const out = NewStyle().border('thick').render('hi');
      expect(out).toContain('┏');
      expect(out).toContain('┛');
    });

    it('selective sides', () => {
      const out = NewStyle().border('normal', true, false, true, false).render('hi');
      expect(out).toContain('─');
      expect(out).not.toContain('│');
    });

    it('border with foreground color', () => {
      const out = NewStyle()
        .border('rounded')
        .borderForeground('#FF0000')
        .render('hi');
      expect(out).toContain('\x1b[38;2;255;0;0m');
    });

    it('border with padding', () => {
      const out = NewStyle()
        .border('rounded')
        .padding(0, 1)
        .render('hi');
      const lines = out.split('\n');
      expect(lines.length).toBe(3); // top border + content + bottom border
      expect(stripAnsi(lines[1])).toContain(' hi ');
    });
  });

  describe('width with border', () => {
    it('width includes border size', () => {
      const out = NewStyle().border('rounded').width(10).render('hi');
      // Total width should be 10 (including borders)
      const lines = out.split('\n');
      expect(StringWidth(lines[0])).toBe(10);
    });
  });

  describe('maxWidth', () => {
    it('truncates to max width', () => {
      const out = NewStyle().maxWidth(5).render('hello world');
      expect(StringWidth(out)).toBeLessThanOrEqual(5);
    });
  });

  describe('maxHeight', () => {
    it('truncates to max height', () => {
      const out = NewStyle().maxHeight(2).render('line1\nline2\nline3');
      expect(out.split('\n').length).toBe(2);
    });
  });

  describe('inline', () => {
    it('removes newlines', () => {
      const out = NewStyle().inline().render('hello\nworld');
      expect(out).not.toContain('\n');
      expect(stripAnsi(out)).toBe('helloworld');
    });
  });

  describe('transform', () => {
    it('applies transform function', () => {
      const out = NewStyle().transform(s => s.toUpperCase()).render('hello');
      expect(stripAnsi(out)).toBe('HELLO');
    });
  });

  describe('setValue', () => {
    it('stores value for render', () => {
      const s = NewStyle().bold().setValue('stored');
      expect(stripAnsi(s.render())).toBe('stored');
      expect(stripAnsi(s.render('extra'))).toBe('stored extra');
    });
  });

  describe('chaining', () => {
    it('complex chain', () => {
      const out = NewStyle()
        .bold()
        .italic()
        .foreground('#FF6B6B')
        .background('#2D2D2D')
        .padding(1, 2)
        .border('rounded')
        .borderForeground('#888888')
        .width(30)
        .align(0.5)
        .render('Hello World');

      // Should contain ANSI codes and the text
      expect(out).toContain('Hello World');
      expect(out.length).toBeGreaterThan('Hello World'.length);
    });
  });

  describe('getters', () => {
    it('reports frame sizes', () => {
      const s = NewStyle()
        .border('rounded')
        .padding(1, 2)
        .margin(1, 2);

      expect(s.getHorizontalBorderSize()).toBe(2);
      expect(s.getVerticalBorderSize()).toBe(2);
      expect(s.getHorizontalPadding()).toBe(4);
      expect(s.getVerticalPadding()).toBe(2);
      expect(s.getHorizontalMargins()).toBe(4);
      expect(s.getVerticalMargins()).toBe(2);
      expect(s.getHorizontalFrameSize()).toBe(10);
      expect(s.getVerticalFrameSize()).toBe(6);
    });
  });
});
