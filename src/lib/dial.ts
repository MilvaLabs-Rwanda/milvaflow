import { startActivityAsync } from 'expo-intent-launcher';
import { Linking, PermissionsAndroid } from 'react-native';

import { toTelUri } from './ussd';

export type DialResult = 'dialed' | 'openedDialer';

/**
 * Runs the USSD code directly when the call permission is granted, so MTN's
 * PIN prompt appears straight away. Without it, the phone's dialer opens
 * with the code typed in and the user presses call themselves.
 */
export async function dialUssd(ussdCode: string): Promise<DialResult> {
  const uri = toTelUri(ussdCode);
  const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CALL_PHONE, {
    title: 'Allow Milvaflow to dial MoMo',
    message: 'Milvaflow dials the MoMo code for you, so you only have to enter your PIN.',
    buttonPositive: 'Allow',
    buttonNegative: 'Not now',
  });

  if (permission === PermissionsAndroid.RESULTS.GRANTED) {
    // ActivityAction has no CALL entry; this is Intent.ACTION_CALL.
    await startActivityAsync('android.intent.action.CALL', { data: uri });
    return 'dialed';
  }

  await Linking.openURL(uri);
  return 'openedDialer';
}
