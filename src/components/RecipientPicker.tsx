import { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  BackHandler,
  Easing,
  Linking,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, X } from 'lucide-react-native';

import { formatAmount } from '../lib/amount';
import {
  getContactsAccess,
  loadContactEntries,
  requestContactsAccess,
  searchContacts,
  type ContactEntry,
  type ContactsAccess,
} from '../lib/contacts';
import type { RecentPayment } from '../lib/recents';
import {
  couldBePartialPhone,
  detectRecipient,
  digitsOnly,
  possibleKinds,
  recipientKey,
  type Recipient,
} from '../lib/recipient';
import { radius, spacing, type, usePalette } from '../theme';
import { Button } from './Button';
import { KindBadge } from './KindBadge';
import { RecipientRow } from './RecipientRow';

type RecipientPickerProps = {
  amount: number;
  recents: RecentPayment[];
  onClose: () => void;
  /** Picking a recipient sends the payment; MTN's PIN prompt is the confirmation. */
  onSelect: (recipient: Recipient) => void;
  onRemoveRecent: (recipient: Recipient) => void;
};

type Row =
  | { type: 'typed'; recipient: Recipient }
  | { type: 'recent'; payment: RecentPayment }
  | { type: 'contact'; entry: ContactEntry };

type Section = { key: string; title?: string; data: Row[] };

function matchesRecent(payment: RecentPayment, query: string): boolean {
  const text = query.trim().toLowerCase();
  if (!text) return true;
  const digits = digitsOnly(query);
  return (
    (payment.recipient.name?.toLowerCase().includes(text) ?? false) ||
    (digits.length > 0 && payment.recipient.value.includes(digits))
  );
}

/**
 * A full-screen layer drawn over the send screen, mounted only while open so
 * the search starts empty and contacts access is re-checked after a trip to
 * Settings. It isn't a `Modal`: on Android a modal is a separate window, and
 * focusing the search before that window has focus leaves the keyboard closed.
 */
export function RecipientPicker({ amount, recents, onClose, onSelect, onRemoveRecent }: RecipientPickerProps) {
  const palette = usePalette();
  const [query, setQuery] = useState('');
  const [chosenKind, setChosenKind] = useState<Recipient['kind'] | null>(null);
  const [access, setAccess] = useState<ContactsAccess | null>(null);
  const [contacts, setContacts] = useState<ContactEntry[] | null>(null);
  const { height } = useWindowDimensions();
  const [offset] = useState(() => new Animated.Value(height));

  useEffect(() => {
    Animated.timing(offset, {
      toValue: 0,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [offset]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [onClose]);

  useEffect(() => {
    getContactsAccess().then(setAccess, (error: unknown) => {
      console.warn('Could not check contacts access', error);
      setAccess('denied');
    });
  }, []);

  useEffect(() => {
    if (access !== 'granted' || contacts !== null) return;
    loadContactEntries().then(setContacts, (error: unknown) => {
      console.warn('Could not read contacts', error);
      setContacts([]);
    });
  }, [access, contacts]);

  const kinds = possibleKinds(query);
  const detected = detectRecipient(query);
  const typed: Recipient | null =
    detected && chosenKind && kinds.includes(chosenKind) ? { ...detected, kind: chosenKind } : detected;

  const typedRecipient: Recipient | null = typed
    ? { ...typed, name: contacts?.find((c) => c.value === typed.value)?.name }
    : null;

  const sections: Section[] = [];
  if (typedRecipient) {
    sections.push({ key: 'typed', data: [{ type: 'typed', recipient: typedRecipient }] });
  }
  const recentRows = recents.filter((p) => matchesRecent(p, query));
  if (recentRows.length > 0) {
    sections.push({ key: 'recent', title: 'Recent', data: recentRows.map((payment) => ({ type: 'recent', payment })) });
  }
  const contactRows = contacts ? searchContacts(contacts, query) : [];
  if (contactRows.length > 0) {
    sections.push({ key: 'contacts', title: 'Contacts', data: contactRows.map((entry) => ({ type: 'contact', entry })) });
  }

  async function allowContacts() {
    const next = await requestContactsAccess();
    setAccess(next);
  }

  function confirmRemove(payment: RecentPayment) {
    const label = payment.recipient.name ?? payment.recipient.value;
    Alert.alert('Remove from recent?', label, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => onRemoveRecent(payment.recipient) },
    ]);
  }

  const typingPhone = couldBePartialPhone(query);

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, { backgroundColor: palette.background, transform: [{ translateY: offset }] }]}
    >
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <Text style={[type.title, { color: palette.text }]}>Send {formatAmount(amount)} RWF to</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} hitSlop={12}>
            <X color={palette.text} size={24} />
          </Pressable>
        </View>

        <View style={[styles.search, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Search color={palette.textMuted} size={20} />
          <TextInput
            accessibilityLabel="Name, phone number, MoMo Pay code or bank account"
            autoFocus
            autoCorrect={false}
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              setChosenKind(null);
            }}
            placeholder="Name, number, MoMo Pay code or account"
            placeholderTextColor={palette.textMuted}
            returnKeyType="done"
            // The keyboard's done key pays only when the input can't be a half-typed number.
            onSubmitEditing={() => typedRecipient && !typingPhone && onSelect(typedRecipient)}
            style={[type.body, styles.input, { color: palette.text }]}
          />
        </View>

        {kinds.length > 1 ? (
          <View style={styles.kinds} accessibilityRole="radiogroup">
            <Text style={[type.caption, { color: palette.textMuted }]}>This is a</Text>
            {kinds.map((kind) => (
              <KindBadge key={kind} kind={kind} selected={typed?.kind === kind} onPress={() => setChosenKind(kind)} />
            ))}
          </View>
        ) : null}

        {typingPhone ? (
          <Text style={[type.caption, styles.hint, { color: palette.textMuted }]}>
            Paying a phone number? Enter all 10 digits.
          </Text>
        ) : null}

        <SectionList
          sections={sections}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          stickySectionHeadersEnabled
          keyExtractor={(row) =>
            row.type === 'contact'
              ? row.entry.id
              : row.type === 'recent'
                ? `recent:${recipientKey(row.payment.recipient)}`
                : `typed:${recipientKey(row.recipient)}`
          }
          renderSectionHeader={({ section }) =>
            section.title ? (
              // Opaque so rows scrolling up pass under the title rather than through it.
              <Text
                style={[type.heading, styles.sectionTitle, { color: palette.textMuted, backgroundColor: palette.background }]}
              >
                {section.title}
              </Text>
            ) : null
          }
          renderItem={({ item }) => {
            const recipient =
              item.type === 'typed' ? item.recipient : item.type === 'recent' ? item.payment.recipient : item.entry;
            return (
              <View
                style={[
                  styles.card,
                  { backgroundColor: item.type === 'typed' ? palette.primarySoft.background : palette.surface },
                ]}
              >
                <RecipientRow
                  recipient={recipient}
                  highlighted={item.type === 'typed'}
                  onPress={() => onSelect(recipient)}
                  onLongPress={item.type === 'recent' ? () => confirmRemove(item.payment) : undefined}
                />
              </View>
            );
          }}
          // Each row is its own card; the gap between them is the separator.
          ItemSeparatorComponent={() => <View style={styles.gap} />}
          ListEmptyComponent={
            <Text style={[type.body, styles.empty, { color: palette.textMuted }]}>
              {query.trim()
                ? `No contacts match "${query.trim()}". Type the full number, MoMo Pay code or account instead.`
                : 'Type a phone number, MoMo Pay code or bank account number.'}
            </Text>
          }
          ListFooterComponent={
            access === 'undetermined' ? (
              <View style={[styles.notice, { backgroundColor: palette.surface }]}>
                <Text style={[type.body, { color: palette.text }]}>Find people in your contacts</Text>
                <Text style={[type.caption, { color: palette.textMuted }]}>
                  Milvaflow reads the names and phone numbers in your contacts so you can search them here. They
                  never leave this phone: Milvaflow has no internet access.
                </Text>
                <Button label="Allow contacts" variant="secondary" onPress={allowContacts} />
              </View>
            ) : access === 'denied' ? (
              <View style={[styles.notice, { backgroundColor: palette.surface }]}>
                <Text style={[type.caption, { color: palette.textMuted }]}>
                  Contacts access is off. Turn it on in Settings to search your contacts.
                </Text>
                <Button label="Open Settings" variant="secondary" onPress={() => Linking.openSettings()} />
              </View>
            ) : null
          }
          style={styles.listFrame}
          contentContainerStyle={styles.list}
        />
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
  },
  kinds: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  hint: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  sectionTitle: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  card: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  gap: {
    height: spacing.sm,
  },
  // A fixed gap, not content padding, so rows never scroll up against the search box.
  listFrame: {
    marginTop: spacing.md,
  },
  list: {
    paddingBottom: spacing.xxl,
  },
  empty: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    lineHeight: 22,
  },
  notice: {
    gap: spacing.sm,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
});
