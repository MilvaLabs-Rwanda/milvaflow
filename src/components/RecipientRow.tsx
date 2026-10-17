import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AndroidHaptics, haptic } from '../lib/haptics';
import { formatRecipientValue, type Recipient } from '../lib/recipient';
import { radius, spacing, type, usePalette } from '../theme';
import { KindBadge } from './KindBadge';

type RecipientRowProps = {
  recipient: Recipient;
  onPress: () => void;
  onLongPress?: () => void;
  /** The number the user typed: its circle matches the highlighted card it sits on. */
  highlighted?: boolean;
};

const AVATAR_SIZE = 48;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? '').slice(0, 2);
  return letters.toUpperCase();
}

function avatarIndex(name: string, count: number): number {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return Math.abs(hash) % count;
}

/** A list row for a contact, a recent recipient, or a typed number. */
export function RecipientRow({ recipient, onPress, onLongPress, highlighted = false }: RecipientRowProps) {
  const palette = usePalette();
  const value = formatRecipientValue(recipient);
  const title = recipient.name ?? value;
  const avatarText = recipient.name && /\p{L}/u.test(recipient.name) ? initials(recipient.name) : '#';
  const avatar = highlighted
    ? { background: palette.surface, foreground: palette.primarySoft.foreground }
    : palette.avatars[avatarIndex(title, palette.avatars.length)];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        // Picking a recipient starts the payment.
        haptic(AndroidHaptics.Confirm);
        onPress();
      }}
      onLongPress={
        onLongPress
          ? () => {
              haptic(AndroidHaptics.Long_Press);
              onLongPress();
            }
          : undefined
      }
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: palette.surfacePressed }]}
    >
      <View style={[styles.avatar, { backgroundColor: avatar.background }]}>
        <Text style={[type.label, { color: avatar.foreground }]}>{avatarText}</Text>
      </View>
      <View style={styles.body}>
        <Text numberOfLines={1} style={[type.rowTitle, { color: palette.text }]}>
          {title}
        </Text>
        <View style={styles.meta}>
          <KindBadge kind={recipient.kind} size="small" />
          {recipient.name ? (
            <Text numberOfLines={1} style={[type.rowDetail, styles.value, { color: palette.textMuted }]}>
              {value}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  value: {
    flexShrink: 1,
  },
});
