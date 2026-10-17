import AsyncStorage from '@react-native-async-storage/async-storage';

import { addRecent, loadRecents, MAX_RECENTS, removeRecent, saveRecents, type RecentPayment } from './recents';

const jean: RecentPayment = {
  recipient: { kind: 'mtn', value: '0788123456', name: 'Jean' },
  amount: 5000,
  sentAt: 1,
};
const shop: RecentPayment = { recipient: { kind: 'momoPay', value: '123456' }, amount: 1200, sentAt: 2 };

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('addRecent', () => {
  it('puts the newest payment first and replaces the older one for the same recipient', () => {
    const again = { ...jean, amount: 7000, sentAt: 3 };
    expect(addRecent([shop, jean], again, again.sentAt)).toEqual([again, shop]);
  });

  it(`keeps at most ${MAX_RECENTS}`, () => {
    const many = Array.from({ length: MAX_RECENTS }, (_, i) => ({
      recipient: { kind: 'momoPay' as const, value: String(1000 + i) },
      amount: 100,
      sentAt: i,
    }));
    const next = addRecent(many, jean, jean.sentAt);
    expect(next).toHaveLength(MAX_RECENTS);
    expect(next[0]).toEqual(jean);
  });
});

describe('removeRecent', () => {
  it('removes by recipient', () => {
    expect(removeRecent([jean, shop], shop.recipient)).toEqual([jean]);
  });
});

describe('storage', () => {
  it('round-trips through AsyncStorage', async () => {
    await saveRecents([jean, shop]);
    expect(await loadRecents()).toEqual([jean, shop]);
  });

  it('returns an empty list when nothing is stored', async () => {
    expect(await loadRecents()).toEqual([]);
  });

  it('drops malformed entries and unreadable data', async () => {
    await AsyncStorage.setItem('recents.v1', JSON.stringify([jean, { amount: 'x' }, { ...shop, recipient: { kind: 'paypal', value: '1' } }]));
    expect(await loadRecents()).toEqual([jean]);

    await AsyncStorage.setItem('recents.v1', '{not json');
    expect(await loadRecents()).toEqual([]);
  });
});
