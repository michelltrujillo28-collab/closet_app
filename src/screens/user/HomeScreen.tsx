import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '../../hooks/useQuery';
import { getStats } from '../../services/stats';
import { listGarments } from '../../services/garments';
import { Button, Card, Empty, Muted, RowItem, Screen, StatCard, Thumbs, Title, pageContent } from '../../components/UI';
import { colors } from '../../theme';
import { GarmentWithRel, OutfitPlan, Stats } from '../../types';

export default function HomeScreen() {
  const { profile } = useAuth();
  const nav = useNavigation<any>();
  const stats = useQuery<Stats>(getStats, { users: 0, garments: 0, outfits: 0, wishlist: 0 });
  const garments = useQuery<GarmentWithRel[]>(listGarments, []);
  return (
    <Screen>
      <ScrollView contentContainerStyle={pageContent}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: colors.primaryDark }}>
          Hola, {profile?.full_name || 'usuario'}
        </Text>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <StatCard value={stats.data.garments} label="Prendas" onPress={() => nav.navigate('Garments')} />
          <StatCard value={stats.data.outfits} label="Outfits" onPress={() => nav.navigate('Studio')} />
          <StatCard value={stats.data.wishlist} label="Deseos" onPress={() => nav.navigate('Wishlist')} />
        </View>

        <Card>
          <Title>Últimas prendas</Title>
          {garments.data.length === 0 ? (
            <Empty text="Aún no tienes prendas" />
          ) : (
            garments.data.slice(0, 3).map((g) => (
              <RowItem
                key={g.id}
                title={g.name}
                imageUrl={g.image_url}
                subtitle={`${g.categories?.name ?? 'Sin categoría'}${g.color ? ' · ' + g.color : ''}`}
              />
            ))
          )}
        </Card>

        <Button title="Agregar prenda" onPress={() => nav.navigate('Garments')} />
        <Button title="Armar un outfit" variant="outline" onPress={() => nav.navigate('Studio')} style={{ marginTop: 10 }} />
      </ScrollView>
    </Screen>
  );
}
