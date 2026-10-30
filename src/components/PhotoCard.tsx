import React from 'react';
import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { colors } from '../theme';

// Ya no se usan emojis. Se deja esta función (devuelve texto vacío) para que
// cualquier pantalla que todavía la importe siga funcionando sin errores.
export function categoryEmoji(_name: string): string {
  return '';
}

type Props = {
  uri?: string | null;
  label: string;
  emoji?: string; // se ignora; se deja para no romper pantallas que aún lo envían
  selected?: boolean;
  onPress?: () => void;
  width?: number;
};

export default function PhotoCard({ uri, label, selected, onPress, width = 104 }: Props) {
  const height = Math.round(width * 1.25);
  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress} style={[styles.card, { width }, selected && styles.selected]}>
      {uri ? (
        <Image source={{ uri }} style={{ width: '100%', height }} resizeMode="cover" />
      ) : (
        <View style={[styles.placeholder, { height }]}>
          <Text style={{ color: colors.muted, fontSize: 12 }}>Sin foto</Text>
        </View>
      )}
      <Text numberOfLines={1} style={styles.label}>{label}</Text>
      {selected && (
        <View style={styles.check}>
          <Text style={{ color: '#fff', fontWeight: '800' }}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 2, borderColor: colors.border, overflow: 'hidden' },
  selected: { borderColor: colors.primary },
  placeholder: { backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 12, fontWeight: '600', color: colors.text, padding: 6, textAlign: 'center' },
  check: {
    position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
});