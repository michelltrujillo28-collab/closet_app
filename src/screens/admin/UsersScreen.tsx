import React from 'react';
import { FlatList } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '../../hooks/useQuery';
import { listProfiles, setRole } from '../../services/profiles';
import { Empty, RowItem, Screen, Title, pageContent } from '../../components/UI';
import { confirmAction, errorMessage, notify } from '../../lib/notify';
import { Profile } from '../../types';

export default function UsersScreen() {
  const { profile } = useAuth();
  const users = useQuery<Profile[]>(listProfiles, []);

  const toggleRole = (u: Profile) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    confirmAction('Cambiar rol', `¿Convertir a ${u.email} en ${newRole}?`, async () => {
      try { await setRole(u.id, newRole); await users.reload(); }
      catch (e) { notify('Error', errorMessage(e)); }
    });
  };

  return (
    <Screen>
      <FlatList
        data={users.data}
        keyExtractor={(u) => u.id}
        contentContainerStyle={pageContent}
        ListHeaderComponent={<Title>Usuarios ({users.data.length})</Title>}
        ListEmptyComponent={<Empty text={users.loading ? 'Cargando...' : 'No hay usuarios.'} />}
        renderItem={({ item }) => (
          <RowItem
            title={item.full_name || 'Sin nombre'}
            subtitle={`${item.email} · ${item.role}`}
            actions={item.id !== profile?.id
              ? [{ label: item.role === 'admin' ? 'Quitar admin' : 'Hacer admin', onPress: () => toggleRole(item) }]
              : []}
          />
        )}
      />
    </Screen>
  );
}
