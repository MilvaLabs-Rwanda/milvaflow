import { useColorScheme } from 'react-native';

import type { RecipientKind } from './lib/recipient';

// Milvalabs brand: navy #2E3251, green #2DC296, sky #7AB5F8. Every other
// value is derived from these. White text on the green fails contrast, so
// anything sitting on `primary` uses `onPrimary` (navy).
const brand = {
  navy: '#2E3251',
  navyDeep: '#1C1F35',
  green: '#2DC296',
  sky: '#7AB5F8',
};

/** A soft background with a readable foreground on top of it. */
export type Tint = { background: string; foreground: string };

export type Palette = {
  background: string;
  surface: string;
  surfacePressed: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  onPrimary: string;
  primarySoft: Tint;
  /** Network badges echo each network's own colour, kept muted. */
  kinds: Record<RecipientKind, Tint>;
  /** Contact initials circles; one is picked per name so it stays stable. */
  avatars: readonly Tint[];
};

const light: Palette = {
  background: '#F6F7FB',
  surface: '#FFFFFF',
  surfacePressed: '#ECEEF5',
  text: brand.navy,
  textMuted: '#6B6F8C',
  border: '#E1E4EE',
  primary: brand.green,
  onPrimary: brand.navy,
  primarySoft: { background: '#E3F7F0', foreground: '#14735A' },
  kinds: {
    mtn: { background: '#FFF3C4', foreground: '#6E5300' },
    airtel: { background: '#FDE4E2', foreground: '#A3241B' },
    momoPay: { background: '#E3F7F0', foreground: '#14735A' },
    bank: { background: '#E6F1FE', foreground: '#1F5FA8' },
  },
  avatars: [
    { background: '#E3F7F0', foreground: '#14735A' },
    { background: '#E6F1FE', foreground: '#1F5FA8' },
    { background: '#E8E9F2', foreground: brand.navy },
    { background: '#EEE8FB', foreground: '#5B3FA8' },
  ],
};

const dark: Palette = {
  background: brand.navyDeep,
  surface: brand.navy,
  surfacePressed: '#3A3F66',
  text: '#F3F4FA',
  textMuted: '#A4A8C4',
  border: '#3C4170',
  primary: brand.green,
  onPrimary: brand.navyDeep,
  primarySoft: { background: '#1D4A45', foreground: '#7BE3C2' },
  kinds: {
    mtn: { background: '#4A3F14', foreground: '#FFD94A' },
    airtel: { background: '#4D2128', foreground: '#FF8F86' },
    momoPay: { background: '#1D4A45', foreground: '#7BE3C2' },
    bank: { background: '#2A3A62', foreground: brand.sky },
  },
  avatars: [
    { background: '#1D4A45', foreground: '#7BE3C2' },
    { background: '#2A3A62', foreground: brand.sky },
    { background: '#3A3F66', foreground: '#E1E3F2' },
    { background: '#3B2F63', foreground: '#C4B2F5' },
  ],
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;

export const type = {
  amount: { fontSize: 56, fontWeight: '700', letterSpacing: -1.5 },
  title: { fontSize: 20, fontWeight: '700' },
  body: { fontSize: 16, fontWeight: '500' },
  label: { fontSize: 14, fontWeight: '600' },
  caption: { fontSize: 13, fontWeight: '500' },
  heading: { fontSize: 16, fontWeight: '700' },
  rowTitle: { fontSize: 18, fontWeight: '600' },
  rowDetail: { fontSize: 15, fontWeight: '500' },
  badge: { fontSize: 11, fontWeight: '700' },
  key: { fontSize: 28, fontWeight: '600' },
} as const;

export function usePalette(): Palette {
  return useColorScheme() === 'dark' ? dark : light;
}
