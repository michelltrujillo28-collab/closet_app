import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '../../hooks/useQuery';
import { getStats } from '../../services/stats';
import { listProfiles } from '../../services/profiles';
import { Card, Empty, Muted, RowItem, Screen, StatCard, Title, pageContent } from '../../components/UI';
import { colors } from '../../theme';
import { Profile, Stats } from '../../types';

export default function DashboardScreen() {
  const { profile } = useAuth();
  const nav = useNavigation<any>();
  const stats = useQuery<Stats>(getStats, { users: 0, garments: 0, outfits: 0, wishlist: 0 });
  const users = useQuery<Profile[]>(listProfiles, []);

  return (
    <Screen>
      <ScrollView contentContainerStyle={pageContent}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: colors.primaryDark }}>Panel de administrador</Text>
        <Muted style={{ marginBottom: 16 }}>{profile?.email}</Muted>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <StatCard value={stats.data.users} label="Usuarios" onPress={() => nav.navigate('Users')} />
          <StatCard value={stats.data.garments} label="Prendas" onPress={() => nav.navigate('AllGarments')} />
          <StatCard value={stats.data.outfits} label="Outfits" />
          <StatCard value={stats.data.wishlist} label="Deseos" />
        </View>

        <Card>
          <Title>Últimos usuarios</Title>
          {users.data.length === 0 ? (
            <Empty text="Sin usuarios." />
          ) : (
            users.data.slice(0, 5).map((u) => (
              <RowItem key={u.id} title={u.full_name || 'Sin nombre'} subtitle={`${u.email} · ${u.role}`} />
            ))
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}
