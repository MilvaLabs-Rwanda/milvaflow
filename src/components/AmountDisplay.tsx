import { Fragment, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';

import { formatAmount, toDigitIndex, toFormattedIndex } from '../lib/amount';
import { type, usePalette } from '../theme';

type AmountDisplayProps = {
  digits: string;
  /** Cursor position, counted in digits. */
  caret: number;
  onCaretChange: (caret: number) => void;
};

// Steps down so the largest amount (11 characters with separators) still fits
// on one line on a narrow phone.
function fontSizeFor(length: number): number {
  if (length <= 7) return type.amount.fontSize;
  if (length <= 9) return 48;
  return 40;
}

function Caret({ color, height }: { color: string; height: number }) {
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0, duration: 500, delay: 400, easing: Easing.step0, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 500, easing: Easing.step0, useNativeDriver: true }),
      ]),
    );
    blink.start();
    return () => blink.stop();
  }, [opacity]);

  // Zero-width so the digits don't shift when the cursor moves between them.
  return (
    <View style={[styles.caretSlot, { height }]}>
      <Animated.View style={[styles.caret, { backgroundColor: color, opacity }]} />
    </View>
  );
}

/**
 * The amount, drawn by the app rather than a native text field so the cursor
 * is fully under the keypad's control. Tapping the left half of a digit puts
 * the cursor before it, the right half after it.
 */
export function AmountDisplay({ digits, caret, onCaretChange }: AmountDisplayProps) {
  const palette = usePalette();
  const widths = useRef<number[]>([]);
  const formatted = digits ? formatAmount(digits) : '';
  const shown = formatted || '0';
  const fontSize = fontSizeFor(shown.length);
  const caretAt = toFormattedIndex(formatted, caret);
  const textStyle = [type.amount, { fontSize, color: formatted ? palette.text : palette.textMuted }];

  function placeCaret(index: number, event: GestureResponderEvent) {
    if (!formatted) return;
    const before = event.nativeEvent.locationX < (widths.current[index] ?? 0) / 2;
    onCaretChange(toDigitIndex(formatted, before ? index : index + 1));
  }

  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`Amount, ${formatAmount(digits)} Rwandan francs`}
    >
      {shown.split('').map((char, index) => (
        // A character's position is its identity here: the same digit can
        // appear several times and nothing is reordered.
        <Fragment key={index}>
          {caretAt === index ? <Caret color={palette.primary} height={fontSize * 1.1} /> : null}
          <Pressable
            onPress={(event) => placeCaret(index, event)}
            onLayout={(event) => {
              widths.current[index] = event.nativeEvent.layout.width;
            }}
            hitSlop={{ top: 24, bottom: 24 }}
          >
            <Text style={textStyle}>{char}</Text>
          </Pressable>
        </Fragment>
      ))}
      {formatted && caretAt === formatted.length ? <Caret color={palette.primary} height={fontSize * 1.1} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caretSlot: {
    width: 0,
  },
  caret: {
    position: 'absolute',
    left: -1.5,
    top: 0,
    bottom: 0,
    width: 3,
    borderRadius: 2,
  },
});
