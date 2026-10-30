import React from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

type LinkItem = { label: string; onPress: () => void };

// Barra superior de las páginas públicas (inicio, login, registro)
export default function PublicTopBar({ links }: { links?: LinkItem[] }) {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < 640;
  const items = links && links.length ? links : [{ label: 'Inicio', onPress: () => nav.navigate('Landing') }];

  return (
    <View style={[styles.bar, { paddingTop: insets.top + 10 }]}>
      <View style={styles.inner}>
        <TouchableOpacity onPress={() => nav.navigate('Landing')}>
          <Text style={styles.brand}>{compact ? 'Closet' : 'Closet Virtual'}</Text>
        </TouchableOpacity>
        <View style={styles.right}>
          {!compact &&
            items.map((l) => (
              <TouchableOpacity key={l.label} onPress={l.onPress}>
                <Text style={styles.link}>{l.label}</Text>
              </TouchableOpacity>
            ))}
          <TouchableOpacity onPress={() => nav.navigate('Login')}>
            <Text style={styles.link}>Iniciar sesión</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => nav.navigate('Register')} style={styles.cta}>
            <Text style={styles.ctaText}>Registrarse</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { backgroundColor: colors.primary, paddingBottom: 12, paddingHorizontal: 16 },
  inner: {
    width: '100%', maxWidth: 1000, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  brand: { color: '#fff', fontSize: 20, fontWeight: '800' },
  right: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  link: { color: '#fff', fontWeight: '600' },
  cta: { backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20 },
  ctaText: { color: colors.primary, fontWeight: '700' },
});
