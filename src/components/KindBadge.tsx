import { Pressable, StyleSheet, Text } from 'react-native';

import { AndroidHaptics, haptic } from '../lib/haptics';
import { RECIPIENT_KIND_LABELS, type RecipientKind } from '../lib/recipient';
import { radius, spacing, type, usePalette } from '../theme';

type KindBadgeProps = {
  kind: RecipientKind;
  /** When set, the badge is a toggle the user can pick. */
  onPress?: () => void;
  selected?: boolean;
  /** `small` sits next to a number in a list row; `regular` is a tappable choice. */
  size?: 'regular' | 'small';
};

export function KindBadge({ kind, onPress, selected = true, size = 'regular' }: KindBadgeProps) {
  const palette = usePalette();
  const colors = selected
    ? { background: palette.kinds[kind].background, text: palette.kinds[kind].foreground, border: palette.kinds[kind].background }
    : { background: 'transparent', text: palette.textMuted, border: palette.border };

  return (
    <Pressable
      accessibilityRole={onPress ? 'radio' : 'text'}
      accessibilityState={onPress ? { checked: selected } : undefined}
      disabled={!onPress}
      onPress={
        onPress
          ? () => {
              haptic(AndroidHaptics.Toggle_On);
              onPress();
            }
          : undefined
      }
      hitSlop={6}
      style={[styles.badge, styles[size], { backgroundColor: colors.background, borderColor: colors.border }]}
    >
      <Text style={[size === 'small' ? type.badge : [type.caption, styles.regularText], { color: colors.text }]}>
        {RECIPIENT_KIND_LABELS[kind]}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  regular: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
  },
  small: {
    paddingHorizontal: spacing.sm - 2,
    paddingVertical: 1,
  },
  regularText: {
    fontWeight: '700',
  },
});
