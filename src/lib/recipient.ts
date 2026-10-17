export type RecipientKind = 'mtn' | 'airtel' | 'momoPay' | 'bank';

export type Recipient = {
  kind: RecipientKind;
  /** Digits only; phone numbers in local `07XXXXXXXX` form. */
  value: string;
  name?: string;
};

export const RECIPIENT_KIND_LABELS: Record<RecipientKind, string> = {
  mtn: 'MTN',
  airtel: 'Airtel',
  momoPay: 'MoMo Pay',
  bank: 'Bank',
};

const MTN_PREFIXES = ['078', '079'];
const AIRTEL_PREFIXES = ['072', '073'];
const PHONE_LENGTH = 10;

// MoMo Pay merchant codes are short; anything longer that isn't a phone
// number is treated as a bank account. The user can override the guess.
const MAX_MOMO_PAY_LENGTH = 7;
const MIN_BANK_ACCOUNT_LENGTH = 5;

export function digitsOnly(input: string): string {
  return input.replace(/\D/g, '');
}

/** Converts `+250 788 123 456`, `250788123456` or `0788123456` to `0788123456`. */
export function normalizePhone(input: string): string {
  const digits = digitsOnly(input);
  if (digits.length === 12 && digits.startsWith('250')) return `0${digits.slice(3)}`;
  if (digits.length === 9 && digits.startsWith('7')) return `0${digits}`;
  return digits;
}

export function phoneNetwork(phone: string): 'mtn' | 'airtel' | null {
  if (phone.length !== PHONE_LENGTH) return null;
  const prefix = phone.slice(0, 3);
  if (MTN_PREFIXES.includes(prefix)) return 'mtn';
  if (AIRTEL_PREFIXES.includes(prefix)) return 'airtel';
  return null;
}

/**
 * True while the user may still be typing an MTN or Airtel number. Such input
 * is also a valid MoMo Pay code or account, so it's offered as one; this only
 * drives the "enter the full number" hint.
 */
export function couldBePartialPhone(input: string): boolean {
  const digits = digitsOnly(input);
  if (!digits.startsWith('07') || digits.length >= PHONE_LENGTH) return false;
  return digits.length < 3 || [...MTN_PREFIXES, ...AIRTEL_PREFIXES].includes(digits.slice(0, 3));
}

/** Best guess at what a typed or pasted value is, or null if nothing fits yet. */
export function detectRecipient(input: string): Recipient | null {
  const phone = normalizePhone(input);
  const network = phoneNetwork(phone);
  if (network) return { kind: network, value: phone };

  const digits = digitsOnly(input);
  if (digits.length === 0) return null;
  if (digits.length <= MAX_MOMO_PAY_LENGTH) return { kind: 'momoPay', value: digits };
  return { kind: 'bank', value: digits };
}

/** Kinds a value could plausibly be, for letting the user correct the guess. */
export function possibleKinds(input: string): RecipientKind[] {
  const network = phoneNetwork(normalizePhone(input));
  if (network) return [network];

  const digits = digitsOnly(input);
  if (digits.length === 0) return [];
  const kinds: RecipientKind[] = ['momoPay'];
  if (digits.length >= MIN_BANK_ACCOUNT_LENGTH) kinds.push('bank');
  return kinds;
}

export function recipientKey(recipient: Recipient): string {
  return `${recipient.kind}:${recipient.value}`;
}

/** `0788123456` → `0788 123 456`; other kinds are shown as typed. */
export function formatRecipientValue(recipient: Recipient): string {
  if (recipient.kind !== 'mtn' && recipient.kind !== 'airtel') return recipient.value;
  const v = recipient.value;
  return `${v.slice(0, 4)} ${v.slice(4, 7)} ${v.slice(7)}`;
}
