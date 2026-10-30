import React, { ReactNode } from 'react';
import {
  TouchableOpacity, Text, TextInput, TextInputProps, StyleSheet, ActivityIndicator,
  StyleProp, ViewStyle, TextStyle, View, Image,
} from 'react-native';
import { colors } from '../theme';

// Contenedor centrado con ancho máximo: se ve bien en celular y en pantallas grandes (responsive)
export const pageContent: ViewStyle = { padding: 16, width: '100%', maxWidth: 800, alignSelf: 'center' };

export function Screen({ children }: { children: ReactNode }) {
  return <View style={{ flex: 1, backgroundColor: colors.bg }}>{children}</View>;
}

type ButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'outline' | 'danger';
  style?: StyleProp<ViewStyle>;
};

export function Button({ title, onPress, loading, variant = 'primary', style }: ButtonProps) {
  const filled = variant === 'primary' || variant === 'danger';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      style={[
        styles.btn,
        variant === 'primary' && { backgroundColor: colors.primary },
        variant === 'danger' && { backgroundColor: colors.danger },
        variant === 'outline' && { borderWidth: 1, borderColor: colors.primary },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={filled ? '#fff' : colors.primary} />
      ) : (
        <Text style={[styles.btnText, variant === 'outline' && { color: colors.primary }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

export function Input(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor="#9ca3af"
      autoCapitalize="none"
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Muted({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[{ color: colors.muted }, style]}>{children}</Text>;
}

export function Empty({ text }: { text: string }) {
  return <Muted style={{ textAlign: 'center', marginVertical: 24 }}>{text}</Muted>;
}

type Option = { label: string; value: string };

// Selector de opciones (una o varias). La pantalla decide qué hacer en onToggle.
export function Chips({ options, selected, onToggle }: {
  options: Option[]; selected: string[]; onToggle: (value: string) => void;
}) {
  return (
    <View style={styles.chips}>
      {options.map((o) => {
        const active = selected.includes(o.value);
        return (
          <TouchableOpacity key={o.value} onPress={() => onToggle(o.value)} style={[styles.chip, active && styles.chipActive]}>
            <Text style={[styles.chipText, active && { color: '#fff' }]}>{o.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function StatCard({ value, label, onPress }: { value: number; label: string; onPress?: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress} style={styles.stat}>
      <Text style={styles.statNum}>{value}</Text>
      <Muted>{label}</Muted>
    </TouchableOpacity>
  );
}

type Action = { label: string; onPress: () => void; danger?: boolean };

// Fila de miniaturas (para outfits)
export function Thumbs({ urls }: { urls: (string | null | undefined)[] }) {
  const valid = urls.filter(Boolean) as string[];
  if (valid.length === 0) return null;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
      {valid.map((u, i) => (
        <Image key={i} source={{ uri: u }} style={{ width: 44, height: 56, borderRadius: 8, backgroundColor: colors.border }} />
      ))}
    </View>
  );
}

export function RowItem({ title, subtitle, actions = [], imageUrl, images }: {
  title: string; subtitle?: string; actions?: Action[]; imageUrl?: string | null; images?: (string | null | undefined)[];
}) {
  return (
    <View style={[styles.row, { flexDirection: 'row', gap: 12 }]}>
      {!!imageUrl && <Image source={{ uri: imageUrl }} style={styles.rowImage} />}
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {!!subtitle && <Muted>{subtitle}</Muted>}
        {images && <Thumbs urls={images} />}
        {actions.length > 0 && (
          <View style={styles.actions}>
            {actions.map((a) => (
              <TouchableOpacity key={a.label} onPress={a.onPress}>
                <Text style={[styles.action, a.danger && { color: colors.danger }]}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: { paddingVertical: 14, paddingHorizontal: 18, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: colors.text, marginBottom: 10,
  },
  card: { backgroundColor: colors.card, padding: 16, borderRadius: 14, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: colors.primary },
  chipActive: { backgroundColor: colors.primary },
  chipText: { color: colors.primary, fontWeight: '600' },
  stat: { flex: 1, minWidth: 100, backgroundColor: colors.card, borderRadius: 14, padding: 16, alignItems: 'center' },
  statNum: { fontSize: 30, fontWeight: '800', color: colors.primary },
  row: { backgroundColor: colors.card, padding: 14, borderRadius: 12, marginBottom: 10 },
  rowImage: { width: 64, height: 80, borderRadius: 10, backgroundColor: colors.border },
  rowTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 8 },
  action: { color: colors.primary, fontWeight: '700' },
});
