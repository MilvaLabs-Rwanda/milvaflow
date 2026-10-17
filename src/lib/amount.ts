// Nine digits covers any amount a MoMo wallet can hold and keeps the display
// on one line.
export const MAX_AMOUNT_DIGITS = 9;

export type KeypadKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '000' | 'back';

/** `caret` counts digits, ignoring the thousands separators on screen. */
export type AmountEdit = { digits: string; caret: number };

function stripLeadingZeros(digits: string, caret: number): AmountEdit {
  const stripped = digits.replace(/^0+/, '');
  return { digits: stripped, caret: Math.max(0, caret - (digits.length - stripped.length)) };
}

/** Applies a keypad press at the cursor: digits go in there, delete removes the digit before it. */
export function applyKey(digits: string, caret: number, key: KeypadKey): AmountEdit {
  const at = Math.max(0, Math.min(caret, digits.length));

  if (key === 'back') {
    if (at === 0) return { digits, caret: 0 };
    return stripLeadingZeros(digits.slice(0, at - 1) + digits.slice(at), at - 1);
  }

  const next = stripLeadingZeros(digits.slice(0, at) + key + digits.slice(at), at + key.length);
  return next.digits.length > MAX_AMOUNT_DIGITS ? { digits, caret: at } : next;
}

export function formatAmount(amount: number | string): string {
  const digits = String(amount);
  if (digits === '') return '0';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** Cursor position in the formatted text → position in the digits. */
export function toDigitIndex(formatted: string, position: number): number {
  return formatted.slice(0, position).replace(/\D/g, '').length;
}

/** Position in the digits → cursor position in the formatted text. */
export function toFormattedIndex(formatted: string, digitIndex: number): number {
  if (digitIndex <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i]) && ++seen === digitIndex) return i + 1;
  }
  return formatted.length;
}
