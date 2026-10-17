import { Contact, ContactField, getPermissionsAsync, requestPermissionsAsync } from 'expo-contacts';

import { digitsOnly, normalizePhone, phoneNetwork, type Recipient } from './recipient';

export type ContactsAccess = 'granted' | 'undetermined' | 'denied';

/** One payable phone number from the address book. */
export type ContactEntry = Recipient & { id: string; name: string };

export async function getContactsAccess(): Promise<ContactsAccess> {
  const { status } = await getPermissionsAsync();
  return status;
}

export async function requestContactsAccess(): Promise<ContactsAccess> {
  const { status } = await requestPermissionsAsync();
  return status;
}

/** Contacts with at least one Rwandan MTN or Airtel number, one entry per number. */
export async function loadContactEntries(): Promise<ContactEntry[]> {
  const contacts = await Contact.getAllDetails([ContactField.FULL_NAME, ContactField.PHONES] as const);
  return toContactEntries(contacts);
}

type ContactDetails = {
  id: string;
  fullName: string | null;
  phones: { number?: string }[] | null | undefined;
};

/** One entry per number; when a number is saved twice, the copy with a name wins. */
export function toContactEntries(contacts: readonly ContactDetails[]): ContactEntry[] {
  const byNumber = new Map<string, ContactEntry>();

  for (const contact of contacts) {
    const name = contact.fullName?.trim();
    for (const phone of contact.phones ?? []) {
      const value = normalizePhone(phone.number ?? '');
      const kind = phoneNetwork(value);
      if (!kind) continue;
      const existing = byNumber.get(value);
      if (existing && (existing.name !== value || !name || name === value)) continue;
      byNumber.set(value, { id: `${contact.id}:${value}`, kind, value, name: name || value });
    }
  }

  return [...byNumber.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function foldForSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

/** Matches on any part of the name, or on the digits of the number. */
export function searchContacts(entries: readonly ContactEntry[], query: string): ContactEntry[] {
  const text = foldForSearch(query.trim());
  if (!text) return [...entries];
  const digits = digitsOnly(query);
  const phoneDigits = digits.startsWith('250') ? digits.slice(3) : digits;

  return entries.filter(
    (entry) =>
      foldForSearch(entry.name).includes(text) ||
      (digits.length >= 3 && entry.value.includes(phoneDigits)),
  );
}
