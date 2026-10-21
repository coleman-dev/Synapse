import { StyleSheet, View } from 'react-native';

import { Copy, Eyebrow } from '@/components/primitives';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, layout } from '@/theme/tokens';

const features = [
  ['01', 'Capture your symptoms', 'Log check-ins by tap or voice.'],
  ['02', 'Understand your patterns', 'Review changes across your history.'],
  ['03', 'Share a clearer story', 'Bring summaries to care conversations.'],
] as const;

export default function AboutScreen() {
  const { colors } = useTheme();
  return (
    <Screen title="About Synapse">
      <View style={styles.content}>
        <View style={styles.intro}>
          <Eyebrow>A MORE CONNECTED BEGINNING</Eyebrow>
          <Copy accessibilityRole="header" style={styles.title}>
            About Synapse.
          </Copy>
          <Copy style={{ color: colors.muted, lineHeight: 21 }}>
            A thoughtful recovery companion for people navigating concussion and vestibular
            symptoms.
          </Copy>
        </View>
        <View style={[styles.mission, { backgroundColor: colors.surface }]}>
          <Eyebrow>OUR MISSION</Eyebrow>
          <Copy style={styles.missionTitle}>
            Make recovery history easier to capture and communicate.
          </Copy>
          <Copy style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>
            Because the details matter. Synapse keeps check-ins and recovery context together for
            clearer conversations about care.
          </Copy>
        </View>
        <View style={styles.features}>
          <Eyebrow>MADE FOR THE MOMENTS BETWEEN VISITS</Eyebrow>
          <View style={{ gap: 11 }}>
            {features.map(([number, title, detail]) => (
              <View key={number} style={styles.feature}>
                <View style={[styles.number, { backgroundColor: colors.surface }]}>
                  <Copy
                    style={{
                      fontFamily: fonts.heading,
                      fontSize: 12,
                      lineHeight: 18,
                      color: colors.accent,
                    }}
                  >
                    {number}
                  </Copy>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Copy style={styles.featureTitle}>{title}</Copy>
                  <Copy style={{ fontSize: 12, lineHeight: 18, color: colors.muted }}>
                    {detail}
                  </Copy>
                </View>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.disclaimer}>
          <View style={{ height: 1, backgroundColor: colors.border }} />
          <Eyebrow>A COMPANION, NOT A DIAGNOSIS</Eyebrow>
          <Copy style={{ color: colors.muted, fontSize: 11, lineHeight: 17 }}>
            Synapse supports documentation and reflection. It does not diagnose or replace
            professional medical care.
          </Copy>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { marginTop: 34, gap: 22 },
  intro: { gap: 9 },
  title: { fontFamily: fonts.heading, fontSize: 32, lineHeight: 43 },
  mission: { paddingHorizontal: 20, paddingVertical: 19, borderRadius: layout.cardRadius, gap: 9 },
  missionTitle: { fontFamily: fonts.heading, fontSize: 18, lineHeight: 25 },
  features: { gap: 13 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  number: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: { fontFamily: fonts.heading, fontSize: 14, lineHeight: 20 },
  disclaimer: { gap: 7 },
});
