import { Image } from 'expo-image';
import { useState, type ComponentProps, type PropsWithChildren, type Ref } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextProps,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { fonts, layout } from '@/theme/tokens';

export function Copy({ style, ...props }: TextProps) {
  const { colors } = useTheme();
  return <Text {...props} style={[styles.copy, { color: colors.text }, style]} />;
}

export function Eyebrow({ children }: PropsWithChildren) {
  const { colors } = useTheme();
  return <Copy style={[styles.eyebrow, { color: colors.accent }]}>{children}</Copy>;
}

export function Heading({
  eyebrow,
  title,
  description,
  recovery = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  recovery?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: recovery ? 10 : 8 }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <Copy
        accessibilityRole="header"
        style={[styles.title, recovery && { fontSize: 29, lineHeight: 42 }]}
      >
        {title}
      </Copy>
      <Copy style={[styles.description, { color: colors.muted }, recovery && { lineHeight: 20 }]}>
        {description}
      </Copy>
    </View>
  );
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: {
  children: string;
  onPress: () => void;
  variant?: 'primary' | 'google';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  const primary = variant === 'primary';
  const [focused, setFocused] = useState(false);
  const foreground = primary ? colors.onPrimary : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={children}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: primary ? colors.primary : colors.surface,
          borderWidth: primary ? 0 : 1,
          borderColor: focused ? colors.accent : colors.border,
          opacity: disabled || loading ? 0.6 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      {!primary && (
        <Image
          source={require('../../assets/icons/google.svg')}
          style={styles.googleIcon}
          contentFit="contain"
          accessibilityElementsHidden
        />
      )}
      {loading ? (
        <ActivityIndicator color={foreground} />
      ) : (
        <Copy
          style={{
            color: foreground,
            fontSize: primary ? 15 : 14,
            fontFamily: primary ? fonts.semibold : fonts.medium,
          }}
        >
          {children}
        </Copy>
      )}
    </Pressable>
  );
}

export function TextLink({
  children,
  onPress,
  muted = false,
  align = 'center',
  style,
  fontSize = 12,
}: {
  children: string;
  onPress: () => void;
  muted?: boolean;
  align?: 'left' | 'center' | 'right';
  style?: ViewStyle;
  fontSize?: number;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      style={({ pressed }) => [
        { minHeight: layout.touchTarget, justifyContent: 'center', opacity: pressed ? 0.7 : 1 },
        style,
      ]}
    >
      <Copy
        style={{
          fontSize,
          lineHeight: fontSize * 1.45,
          color: muted ? colors.muted : colors.accent,
          textAlign: align,
        }}
      >
        {children}
      </Copy>
    </Pressable>
  );
}

type FieldProps = ComponentProps<typeof TextInput> & {
  label: string;
  error?: string;
  password?: boolean;
  ref?: Ref<TextInput>;
};

export function InputField({ label, error, password = false, style, ...props }: FieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.field}>
      <Copy nativeID={`${props.nativeID}-label`} style={styles.fieldLabel}>
        {label}
      </Copy>
      <View
        style={[
          styles.inputFrame,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.error : focused ? colors.accent : colors.border,
          },
        ]}
      >
        <TextInput
          {...props}
          accessibilityLabel={label}
          accessibilityHint={error}
          aria-invalid={!!error}
          placeholderTextColor={colors.muted}
          selectionColor={colors.accent}
          secureTextEntry={password && !visible}
          autoCorrect={password ? false : props.autoCorrect}
          onFocus={(event) => {
            setFocused(true);
            props.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            props.onBlur?.(event);
          }}
          style={[styles.input, { color: colors.text }, password && { paddingRight: 52 }, style]}
        />
        {password && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
            accessibilityState={{ selected: visible }}
            onPress={() => setVisible(!visible)}
            style={styles.reveal}
          >
            <Copy style={{ fontSize: 10, color: colors.accent }}>{visible ? 'Hide' : 'Show'}</Copy>
          </Pressable>
        )}
      </View>
      {!!error && (
        <Copy
          accessibilityLiveRegion="polite"
          style={{ fontSize: 11, lineHeight: 16, color: colors.error }}
        >
          {error}
        </Copy>
      )}
    </View>
  );
}

export function Divider() {
  const { colors } = useTheme();
  return (
    <View style={styles.divider} accessibilityElementsHidden>
      <View style={[styles.line, { backgroundColor: colors.border }]} />
      <Copy style={{ color: colors.muted, fontSize: 12, width: 16, textAlign: 'center' }}>or</Copy>
      <View style={[styles.line, { backgroundColor: colors.border }]} />
    </View>
  );
}

export function Notice({ message, success = false }: { message?: string; success?: boolean }) {
  const { colors } = useTheme();
  if (!message) return null;
  return (
    <View
      style={[
        styles.notice,
        { borderColor: success ? colors.accent : colors.error, backgroundColor: colors.surface },
      ]}
    >
      <Copy
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={{ color: success ? colors.text : colors.error, fontSize: 12, lineHeight: 18 }}
      >
        {message}
      </Copy>
    </View>
  );
}

const styles = StyleSheet.create({
  copy: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20.3, includeFontPadding: false },
  eyebrow: { fontFamily: fonts.heading, fontSize: 10, lineHeight: 15 },
  title: { fontFamily: fonts.heading, fontSize: 30, lineHeight: 43.5 },
  description: { fontSize: 14, lineHeight: 20.3 },
  button: {
    minHeight: layout.buttonHeight,
    borderRadius: layout.buttonRadius,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 44,
    paddingVertical: 12,
  },
  googleIcon: { position: 'absolute', left: 20, width: 20, height: 20 },
  field: { gap: layout.fieldGap },
  fieldLabel: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 20 },
  inputFrame: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: layout.inputHeight,
    borderWidth: 1,
    borderRadius: layout.inputRadius,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 11,
    paddingHorizontal: 15,
    includeFontPadding: false,
  },
  reveal: {
    position: 'absolute',
    right: 0,
    top: -1,
    bottom: -1,
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 8,
  },
  divider: { flexDirection: 'row', gap: 14, alignItems: 'center', minHeight: 20 },
  line: { height: 1, flex: 1 },
  notice: { borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 12 },
});
