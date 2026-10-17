import AsyncStorage from '@react-native-async-storage/async-storage';

import { recipientKey, type Recipient, type RecipientKind } from './recipient';

/**
 * A payment the user started. The app can't see whether MTN completed it,
 * so this is a list of attempts, kept so a failed one can be retried in a tap.
 */
export type RecentPayment = {
  recipient: Recipient;
  amount: number;
  sentAt: number;
};

const STORAGE_KEY = 'recents.v1';
export const MAX_RECENTS = 8;

const KINDS: readonly RecipientKind[] = ['mtn', 'airtel', 'momoPay', 'bank'];

function isRecentPayment(value: unknown): value is RecentPayment {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  const r = v.recipient as Record<string, unknown> | null | undefined;
  return (
    typeof v.amount === 'number' &&
    typeof v.sentAt === 'number' &&
    typeof r === 'object' &&
    r !== null &&
    KINDS.includes(r.kind as RecipientKind) &&
    typeof r.value === 'string' &&
    (r.name === undefined || typeof r.name === 'string')
  );
}

export async function loadRecents(): Promise<RecentPayment[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isRecentPayment) : [];
  } catch {
    // Unreadable data is only a convenience list; start it over rather than
    // blocking the app.
    return [];
  }
}

/** Puts the payment first, dropping any older entry for the same recipient. */
export function addRecent(
  recents: RecentPayment[],
  { recipient, amount }: Pick<RecentPayment, 'recipient' | 'amount'>,
  sentAt = Date.now(),
): RecentPayment[] {
  const payment: RecentPayment = { recipient, amount, sentAt };
  const key = recipientKey(recipient);
  return [payment, ...recents.filter((r) => recipientKey(r.recipient) !== key)].slice(0, MAX_RECENTS);
}

export function removeRecent(recents: RecentPayment[], recipient: Recipient): RecentPayment[] {
  const key = recipientKey(recipient);
  return recents.filter((r) => recipientKey(r.recipient) !== key);
}

export async function saveRecents(recents: RecentPayment[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recents));
}
