import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Copy, Divider, Notice, TextLink } from '@/components/primitives';
import { BrandLogo, Screen } from '@/components/Screen';
import { signInGoogle } from '@/features/auth/service';
import { useAuthAction } from '@/features/auth/useAuthAction';
import { fonts } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

export default function WelcomeScreen() {
  const action = useAuthAction();
  const { theme } = useTheme();
  return (
    <Screen welcome title="Welcome to Synapse">
      <View style={[styles.hero, { marginTop: theme === 'dark' ? 57 : 53 }]}>
        <BrandLogo welcome />
      </View>
      <Copy
        accessibilityRole="header"
        style={[styles.wordmark, { marginTop: theme === 'dark' ? 8 : 12 }]}
      >
        Synapse
      </Copy>
      <View style={styles.actions}>
        <Button onPress={() => router.push('/sign-up')}>Get started</Button>
        <Divider />
        <Button
          variant="google"
          loading={action.loading}
          onPress={() =>
            void action.run(async () => {
              await signInGoogle();
              router.push('/sign-in');
            })
          }
        >
          Sign in with Google
        </Button>
        <TextLink muted style={styles.accountLink} onPress={() => router.push('/sign-in')}>
          Already have an account? Sign in
        </TextLink>
        <Notice message={action.message} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center' },
  wordmark: { fontFamily: fonts.heading, fontSize: 40, lineHeight: 52, textAlign: 'center' },
  actions: { marginTop: 76, gap: 16 },
  accountLink: { marginTop: -13.5 },
});
