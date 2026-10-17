import { AndroidHaptics, performAndroidHapticsAsync } from 'expo-haptics';

export { AndroidHaptics };

/**
 * Touch feedback through Android's own haptic effects. They follow the
 * phone's touch-feedback setting and need no vibrate permission.
 */
export function haptic(effect: AndroidHaptics): void {
  performAndroidHapticsAsync(effect).catch((error: unknown) => console.warn('Could not play haptic feedback', error));
}
