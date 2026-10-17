import { Pressable, StyleSheet, Text } from 'react-native';

import { AndroidHaptics, haptic } from '../lib/haptics';
import { radius, spacing, type, usePalette } from '../theme';

type ButtonVariant = 'primary' | 'secondary';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
};

export function Button({ label, onPress, variant = 'primary', disabled = false }: ButtonProps) {
  const palette = usePalette();
  const colors =
    variant === 'primary'
      ? { background: palette.primary, text: palette.onPrimary }
      : { background: palette.surfacePressed, text: palette.text };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        haptic(AndroidHaptics.Virtual_Key);
        onPress();
      }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.background, opacity: disabled ? 0.4 : pressed ? 0.85 : 1 },
      ]}
    >
      <Text style={[type.body, styles.label, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '700',
  },
});
