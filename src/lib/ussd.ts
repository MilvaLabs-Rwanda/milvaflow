import type { Recipient, RecipientKind } from './recipient';

// MTN MoMo menu paths, confirmed on a real MTN SIM. The full code is dialed
// in one go so the user only ever sees MTN's PIN prompt. Airtel recipients
// share the "send to a number" path; eKash resolves the bank from the
// account number on its own.
const MTN_MENU_PATHS: Record<RecipientKind, string> = {
  mtn: '*182*1*1',
  airtel: '*182*1*1',
  momoPay: '*182*8*1',
  bank: '*182*1*2',
};

export function buildUssdCode(recipient: Recipient, amount: number): string {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error(`Invalid amount: ${amount}`);
  }
  if (!/^\d+$/.test(recipient.value)) {
    throw new Error(`Invalid recipient value for ${recipient.kind}`);
  }
  return `${MTN_MENU_PATHS[recipient.kind]}*${recipient.value}*${amount}#`;
}

/** Android drops everything after an unescaped `#` in a tel URI. */
export function toTelUri(ussdCode: string): string {
  return `tel:${ussdCode.replace(/#/g, '%23')}`;
}
