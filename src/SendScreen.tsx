import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmountDisplay } from './components/AmountDisplay';
import { Button } from './components/Button';
import { Keypad } from './components/Keypad';
import { RecipientPicker } from './components/RecipientPicker';
import { applyKey, formatAmount, type AmountEdit, type KeypadKey } from './lib/amount';
import { dialUssd } from './lib/dial';
import { addRecent, loadRecents, removeRecent, saveRecents, type RecentPayment } from './lib/recents';
import type { Recipient } from './lib/recipient';
import { shouldStartOver } from './lib/session';
import { buildUssdCode } from './lib/ussd';
import { radius, spacing, type, usePalette } from './theme';

const EMPTY_ENTRY: AmountEdit = { digits: '', caret: 0 };

export function SendScreen() {
  const palette = usePalette();
  // Digits and cursor change together, and fast taps must each build on the
  // previous one, so they live in one state value updated functionally.
  const [entry, setEntry] = useState<AmountEdit>(EMPTY_ENTRY);
  const amount = entry.digits;
  const [recents, setRecents] = useState<RecentPayment[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  // A ref, not state: a second tap must be ignored before React re-renders.
  const sending = useRef(false);

  useEffect(() => {
    loadRecents().then(setRecents, (error: unknown) => console.warn('Could not load recent payments', error));
  }, []);

  useEffect(() => {
    let leftAt: number | null = null;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background') {
        leftAt = Date.now();
      } else if (state === 'active' && leftAt !== null) {
        if (shouldStartOver(leftAt, Date.now())) {
          setPickerOpen(false);
          setEntry(EMPTY_ENTRY);
        }
        leftAt = null;
      }
    });
    return () => subscription.remove();
  }, []);

  function updateRecents(next: RecentPayment[]) {
    setRecents(next);
    saveRecents(next).catch((error: unknown) => console.warn('Could not save recent payments', error));
  }

  function pressKey(key: KeypadKey) {
    setEntry((current) => applyKey(current.digits, current.caret, key));
  }

  function clearAmount() {
    setEntry(EMPTY_ENTRY);
  }

  const closePicker = useCallback(() => setPickerOpen(false), []);

  async function pay(recipient: Recipient, value: number) {
    if (sending.current) return;
    sending.current = true;
    const ussdCode = buildUssdCode(recipient, value);
    try {
      updateRecents(addRecent(recents, { recipient, amount: value }));
      setPickerOpen(false);
      clearAmount();
      await dialUssd(ussdCode);
    } catch (error) {
      console.warn('Could not dial USSD code', error);
      Alert.alert('Could not start the payment', `Dial ${ussdCode} from your phone app instead.`);
    } finally {
      sending.current = false;
    }
  }

  const amountValue = Number(amount || '0');

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <SafeAreaView
        style={styles.screen}
        // Hidden from screen readers while the picker covers it.
        importantForAccessibility={pickerOpen ? 'no-hide-descendants' : 'auto'}
      >
        <View style={styles.header}>
          <View style={[styles.dot, { backgroundColor: palette.primary }]} />
          <Text style={[type.title, { color: palette.text }]}>milvaflow</Text>
          <Text style={[type.caption, styles.credit, { color: palette.textMuted }]}>by MilvaLabs</Text>
        </View>

        <View style={styles.amountBlock}>
          <Text style={[type.label, { color: palette.textMuted }]}>RWF</Text>
          <AmountDisplay
            digits={amount}
            caret={entry.caret}
            onCaretChange={(caret) => setEntry((current) => ({ ...current, caret }))}
          />
        </View>

        <View style={styles.keypad}>
          <Keypad onKey={pressKey} onClear={clearAmount} />
        </View>

        <View style={styles.footer}>
          <Button
            label={amountValue > 0 ? `Pay ${formatAmount(amountValue)} RWF` : 'Enter an amount'}
            disabled={amountValue <= 0}
            onPress={() => setPickerOpen(true)}
          />
        </View>
      </SafeAreaView>

      {pickerOpen ? (
        <RecipientPicker
          amount={amountValue}
          recents={recents}
          onClose={closePicker}
          onSelect={(recipient) => pay(recipient, amountValue)}
          onRemoveRecent={(recipient) => updateRecents(removeRecent(recents, recipient))}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  credit: {
    marginLeft: spacing.xs,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
  },
  amountBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    minHeight: 120,
  },
  keypad: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
});
