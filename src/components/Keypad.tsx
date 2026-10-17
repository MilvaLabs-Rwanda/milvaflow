import { Delete } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { KeypadKey } from '../lib/amount';
import { AndroidHaptics, haptic } from '../lib/haptics';
import { radius, type, usePalette } from '../theme';

const ROWS: KeypadKey[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['000', '0', 'back'],
];

type KeypadProps = {
  onKey: (key: KeypadKey) => void;
  onClear: () => void;
};

export function Keypad({ onKey, onClear }: KeypadProps) {
  const palette = usePalette();

  return (
    <View style={styles.grid}>
      {ROWS.map((row) => (
        <View key={row.join('')} style={styles.row}>
          {row.map((key) => (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={key === 'back' ? 'Delete' : key}
              accessibilityHint={key === 'back' ? 'Hold to clear the amount' : undefined}
              onPress={() => {
                haptic(AndroidHaptics.Keyboard_Tap);
                onKey(key);
              }}
              onLongPress={
                key === 'back'
                  ? () => {
                      haptic(AndroidHaptics.Long_Press);
                      onClear();
                    }
                  : undefined
              }
              style={({ pressed }) => [styles.key, pressed && { backgroundColor: palette.surfacePressed }]}
            >
              {key === 'back' ? (
                <Delete color={palette.text} size={26} />
              ) : (
                <Text style={[type.key, { color: palette.text }]}>{key}</Text>
              )}
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  key: {
    flex: 1,
    height: 60,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
