import { applyKey, formatAmount, MAX_AMOUNT_DIGITS, toDigitIndex, toFormattedIndex } from './amount';

describe('applyKey', () => {
  it('appends at the end and deletes the last digit', () => {
    expect(applyKey('50', 2, '0')).toEqual({ digits: '500', caret: 3 });
    expect(applyKey('500', 3, 'back')).toEqual({ digits: '50', caret: 2 });
    expect(applyKey('', 0, 'back')).toEqual({ digits: '', caret: 0 });
  });

  it('edits in the middle: 25000 → 26000', () => {
    const deleted = applyKey('25000', 2, 'back');
    expect(deleted).toEqual({ digits: '2000', caret: 1 });
    expect(applyKey(deleted.digits, deleted.caret, '6')).toEqual({ digits: '26000', caret: 2 });
  });

  it('inserts at the start', () => {
    expect(applyKey('5000', 0, '1')).toEqual({ digits: '15000', caret: 1 });
  });

  it('adds three zeros at once', () => {
    expect(applyKey('5', 1, '000')).toEqual({ digits: '5000', caret: 4 });
  });

  it('never keeps leading zeros', () => {
    expect(applyKey('', 0, '0')).toEqual({ digits: '', caret: 0 });
    expect(applyKey('', 0, '000')).toEqual({ digits: '', caret: 0 });
    expect(applyKey('105', 1, 'back')).toEqual({ digits: '5', caret: 0 });
    expect(applyKey('500', 0, '0')).toEqual({ digits: '500', caret: 0 });
  });

  it('keeps the cursor in range', () => {
    expect(applyKey('12', 9, '3')).toEqual({ digits: '123', caret: 3 });
  });

  it(`stops at ${MAX_AMOUNT_DIGITS} digits`, () => {
    const full = '9'.repeat(MAX_AMOUNT_DIGITS);
    expect(applyKey(full, 3, '1')).toEqual({ digits: full, caret: 3 });
    const almost = '9'.repeat(MAX_AMOUNT_DIGITS - 1);
    expect(applyKey(almost, almost.length, '000').digits).toBe(almost);
  });
});

describe('formatAmount', () => {
  it.each([
    ['', '0'],
    ['5', '5'],
    ['5000', '5,000'],
    [1250000, '1,250,000'],
  ])('%s → %s', (input, expected) => {
    expect(formatAmount(input)).toBe(expected);
  });
});

describe('cursor mapping', () => {
  it('skips separators in both directions', () => {
    // "25,000": tapping just after the 5 (position 2) or after the comma (3)
    // is the same spot in the digits.
    expect(toDigitIndex('25,000', 2)).toBe(2);
    expect(toDigitIndex('25,000', 3)).toBe(2);
    expect(toDigitIndex('25,000', 6)).toBe(5);
    expect(toFormattedIndex('25,000', 2)).toBe(2);
    expect(toFormattedIndex('25,000', 3)).toBe(4);
    expect(toFormattedIndex('25,000', 0)).toBe(0);
    expect(toFormattedIndex('25,000', 5)).toBe(6);
  });
});
