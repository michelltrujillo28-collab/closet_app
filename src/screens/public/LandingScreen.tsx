import React, { useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import PublicTopBar from '../../components/PublicTopBar';
import { Button } from '../../components/UI';
import { colors } from '../../theme';
import { AuthStackParamList } from '../../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Landing'>;

const FEATURES = [
  {  title: 'Sube tus prendas', text: 'Guarda cada prenda con su foto, color, talla y marca.' },
  {  title: 'Arma outfits', text: 'Elige una blusa, un pantalón, zapatos y complementos, y mira cómo queda.' },
  {  title: 'Planea tu semana', text: 'Asigna un outfit a cada día en tu calendario.' },
  { title: 'Lista de deseos', text: 'Anota lo que quieres comprar y márcalo cuando lo tengas.' },
];

const STEPS = [
  'Crea tu cuenta gratis.',
  'Sube las fotos de tu ropa.',
  'Arma tus outfits y ponlos en el calendario.',
];

export default function LandingScreen({ navigation }: Props) {
  const ref = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const offsets = useRef<Record<string, number>>({});
  const { width } = useWindowDimensions();
  const wide = width >= 800;

  const goTo = (key: string) => ref.current?.scrollTo({ y: offsets.current[key] ?? 0, animated: true });
  const mark = (key: string) => ({ onLayout: (e: any) => { offsets.current[key] = e.nativeEvent.layout.y; } });

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <PublicTopBar
        links={[
          { label: 'Inicio', onPress: () => goTo('top') },
          { label: 'Funciones', onPress: () => goTo('features') },
          { label: 'Cómo funciona', onPress: () => goTo('how') },
        ]}
      />
      <ScrollView ref={ref}>
        {/* HERO */}
        <View style={styles.hero} {...mark('top')}>
          <View style={[styles.heroInner, wide && { flexDirection: 'row', alignItems: 'center' }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.heroTitle, wide && { fontSize: 46 }]}>Tu closet, siempre contigo</Text>
              <Text style={styles.heroText}>
                Organiza tu ropa, arma outfits con fotos y planea qué te vas a poner cada día. Desde el celular o desde la web.
              </Text>
              <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
                <Button title="Crear cuenta gratis" onPress={() => navigation.navigate('Register')} style={styles.heroBtn} />
                <Button title="Ya tengo cuenta" variant="outline" onPress={() => navigation.navigate('Login')} style={styles.heroBtnOutline} />
              </View>
            </View>
          </View>
        </View>

        {/* FUNCIONES */}
        <View style={styles.section} {...mark('features')}>
          <Text style={styles.h2}>Todo lo que necesitas</Text>
          <View style={styles.grid}>
            {FEATURES.map((f) => (
              <View key={f.title} style={styles.feature}>
                <Text style={{ fontSize: 32 }}></Text>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={{ color: colors.muted }}>{f.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CÓMO FUNCIONA */}
        <View style={styles.section} {...mark('how')}>
          <Text style={styles.h2}>¿Cómo funciona?</Text>
          {STEPS.map((s, i) => (
            <View key={s} style={styles.step}>
              <View style={styles.stepNum}><Text style={{ color: '#fff', fontWeight: '800' }}>{i + 1}</Text></View>
              <Text style={{ flex: 1, fontSize: 16, color: colors.text }}>{s}</Text>
            </View>
          ))}
          <Button title="Empezar ahora" onPress={() => navigation.navigate('Register')} style={{ marginTop: 16 }} />
        </View>

      
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.primaryDark, paddingVertical: 48, paddingHorizontal: 20 },
  heroInner: { width: '100%', maxWidth: 1000, alignSelf: 'center', gap: 24 },
  heroTitle: { fontSize: 34, fontWeight: '800', color: '#fff' },
  heroText: { color: '#e9d5ff', fontSize: 17, marginTop: 12, lineHeight: 26 },
  heroBtn: { backgroundColor: '#8f43f4' },
  heroBtnOutline: { borderColor: '#fff' },
  section: { width: '100%', maxWidth: 1000, alignSelf: 'center', paddingVertical: 36, paddingHorizontal: 20 },
  h2: { fontSize: 26, fontWeight: '800', color: colors.primaryDark, marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  feature: { flexGrow: 1, flexBasis: 220, backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 6 },
  featureTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  step: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10 },
  stepNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  footer: { paddingVertical: 28, paddingHorizontal: 20 },
});
