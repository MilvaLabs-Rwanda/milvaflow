import {
  couldBePartialPhone,
  detectRecipient,
  formatRecipientValue,
  normalizePhone,
  possibleKinds,
} from './recipient';

describe('normalizePhone', () => {
  it.each([
    ['0788123456', '0788123456'],
    ['+250 788 123 456', '0788123456'],
    ['250788123456', '0788123456'],
    ['788123456', '0788123456'],
    ['(078) 812-3456', '0788123456'],
  ])('%s → %s', (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });
});

describe('detectRecipient', () => {
  it('recognises MTN numbers', () => {
    expect(detectRecipient('0788123456')).toEqual({ kind: 'mtn', value: '0788123456' });
    expect(detectRecipient('+250 798 123 456')).toEqual({ kind: 'mtn', value: '0798123456' });
  });

  it('recognises Airtel numbers', () => {
    expect(detectRecipient('0728123456')).toEqual({ kind: 'airtel', value: '0728123456' });
    expect(detectRecipient('0738123456')).toEqual({ kind: 'airtel', value: '0738123456' });
  });

  it('offers input that starts like a phone but is not a full number as a code or account', () => {
    expect(detectRecipient('072455')).toEqual({ kind: 'momoPay', value: '072455' });
    expect(detectRecipient('078812345')).toEqual({ kind: 'bank', value: '078812345' });
    expect(detectRecipient('07881234567')).toEqual({ kind: 'bank', value: '07881234567' });
    expect(detectRecipient('0751234567')).toEqual({ kind: 'bank', value: '0751234567' });
  });

  it('treats short codes as MoMo Pay and long numbers as bank accounts', () => {
    expect(detectRecipient('123456')).toEqual({ kind: 'momoPay', value: '123456' });
    expect(detectRecipient('4001234567890')).toEqual({ kind: 'bank', value: '4001234567890' });
  });

  it('returns null for empty or non-numeric input', () => {
    expect(detectRecipient('')).toBeNull();
    expect(detectRecipient('Jean')).toBeNull();
  });
});

describe('possibleKinds', () => {
  it('offers only the network for phone numbers', () => {
    expect(possibleKinds('0788123456')).toEqual(['mtn']);
  });

  it('offers MoMo Pay and bank for numbers that could be either', () => {
    expect(possibleKinds('123456')).toEqual(['momoPay', 'bank']);
    expect(possibleKinds('1234')).toEqual(['momoPay']);
    expect(possibleKinds('072455')).toEqual(['momoPay', 'bank']);
  });
});

describe('couldBePartialPhone', () => {
  it('is true while an MTN or Airtel number is still being typed', () => {
    expect(couldBePartialPhone('07')).toBe(true);
    expect(couldBePartialPhone('072455')).toBe(true);
    expect(couldBePartialPhone('078812345')).toBe(true);
  });

  it('is false for full numbers, longer input and other prefixes', () => {
    expect(couldBePartialPhone('0788123456')).toBe(false);
    expect(couldBePartialPhone('07881234567')).toBe(false);
    expect(couldBePartialPhone('0751')).toBe(false);
    expect(couldBePartialPhone('123456')).toBe(false);
  });
});

describe('formatRecipientValue', () => {
  it('groups phone numbers and leaves other values as typed', () => {
    expect(formatRecipientValue({ kind: 'mtn', value: '0788123456' })).toBe('0788 123 456');
    expect(formatRecipientValue({ kind: 'bank', value: '4001234567890' })).toBe('4001234567890');
  });
});
