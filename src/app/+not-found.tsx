import { router } from 'expo-router';
import { View } from 'react-native';
import { Button, Heading } from '@/components/primitives';
import { Screen } from '@/components/Screen';

export default function NotFoundScreen() {
  return (
    <Screen title="Page not found">
      <View style={{ marginTop: 52, gap: 24 }}>
        <Heading
          eyebrow="LET’S GET YOU BACK"
          title="Page not found"
          description="Return to the start of your Synapse journey."
        />
        <Button onPress={() => router.replace('/')}>Back to welcome</Button>
      </View>
    </Screen>
  );
}
