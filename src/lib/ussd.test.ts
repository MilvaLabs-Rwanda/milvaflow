import { buildUssdCode, toTelUri } from './ussd';

describe('buildUssdCode', () => {
  it.each([
    [{ kind: 'mtn', value: '0788123456' }, '*182*1*1*0788123456*5000#'],
    [{ kind: 'airtel', value: '0731234567' }, '*182*1*1*0731234567*5000#'],
    [{ kind: 'momoPay', value: '123456' }, '*182*8*1*123456*5000#'],
    [{ kind: 'bank', value: '4001234567890' }, '*182*1*2*4001234567890*5000#'],
  ] as const)('%o', (recipient, expected) => {
    expect(buildUssdCode(recipient, 5000)).toBe(expected);
  });

  it('rejects amounts that are not positive whole numbers', () => {
    const recipient = { kind: 'mtn', value: '0788123456' } as const;
    expect(() => buildUssdCode(recipient, 0)).toThrow();
    expect(() => buildUssdCode(recipient, 12.5)).toThrow();
  });

  it('rejects values that would change the menu path', () => {
    expect(() => buildUssdCode({ kind: 'bank', value: '123*456#' }, 5000)).toThrow();
  });
});

describe('toTelUri', () => {
  it('escapes # so Android keeps the end of the code', () => {
    expect(toTelUri('*182*1*1*0788123456*5000#')).toBe('tel:*182*1*1*0788123456*5000%23');
  });
});
