import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SendScreen } from './src/SendScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <SendScreen />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
