import { searchContacts, toContactEntries } from './contacts';

// Only the pure helpers are tested here; the native contacts module isn't
// available under Jest.
jest.mock('expo-contacts', () => ({ Contact: {}, ContactField: {} }));

const raw = [
  { id: '1', fullName: 'Uwase Aline', phones: [{ number: '+250 788 123 456' }, { number: '0788123456' }] },
  { id: '0', fullName: null, phones: [{ number: '0731234567' }] },
  { id: '2', fullName: 'Éric Mugisha', phones: [{ number: '0731234567' }, { number: '+1 415 555 0100' }] },
  { id: '3', fullName: null, phones: [{ number: '0798765432' }] },
  { id: '4', fullName: 'No Phone', phones: null },
  { id: '5', fullName: '0731234567', phones: [{ number: '0731234567' }] },
];

describe('toContactEntries', () => {
  const entries = toContactEntries(raw);

  it('keeps only Rwandan MTN and Airtel numbers, once each, preferring a named copy', () => {
    expect(entries.map((e) => [e.name, e.kind, e.value])).toEqual([
      ['0798765432', 'mtn', '0798765432'],
      ['Éric Mugisha', 'airtel', '0731234567'],
      ['Uwase Aline', 'mtn', '0788123456'],
    ]);
  });
});

describe('searchContacts', () => {
  const entries = toContactEntries(raw);

  it('matches names ignoring case and accents', () => {
    expect(searchContacts(entries, 'eric').map((e) => e.name)).toEqual(['Éric Mugisha']);
    expect(searchContacts(entries, 'ALINE').map((e) => e.name)).toEqual(['Uwase Aline']);
  });

  it('matches number digits, including +250 form', () => {
    expect(searchContacts(entries, '0788 12').map((e) => e.name)).toEqual(['Uwase Aline']);
    expect(searchContacts(entries, '+250 73').map((e) => e.name)).toEqual(['Éric Mugisha']);
  });

  it('returns everything for an empty query', () => {
    expect(searchContacts(entries, '  ')).toHaveLength(3);
  });
});
