import React from 'react';
import { FlatList } from 'react-native';
import { useQuery } from '../../hooks/useQuery';
import { deleteGarment, listAllGarments } from '../../services/garments';
import { Empty, RowItem, Screen, Title, pageContent } from '../../components/UI';
import { confirmAction, errorMessage, notify } from '../../lib/notify';
import { GarmentWithRel } from '../../types';

export default function AllGarmentsScreen() {
  const garments = useQuery<GarmentWithRel[]>(listAllGarments, []);

  const remove = (g: GarmentWithRel) =>
    confirmAction('Eliminar prenda', `¿Eliminar "${g.name}" de ${g.profiles?.email ?? 'este usuario'}?`, async () => {
      try { await deleteGarment(g.id); await garments.reload(); }
      catch (e) { notify('Error', errorMessage(e)); }
    });

  return (
    <Screen>
      <FlatList
        data={garments.data}
        keyExtractor={(g) => g.id}
        contentContainerStyle={pageContent}
        ListHeaderComponent={<Title>Todas las prendas ({garments.data.length})</Title>}
        ListEmptyComponent={<Empty text={garments.loading ? 'Cargando...' : 'No hay prendas registradas.'} />}
        renderItem={({ item }) => (
          <RowItem
            title={item.name}
            imageUrl={item.image_url}
            subtitle={`${item.categories?.name ?? 'Sin categoría'}${item.color ? ' · ' + item.color : ''} — ${item.profiles?.email ?? ''}`}
            actions={[{ label: 'Eliminar', onPress: () => remove(item), danger: true }]}
          />
        )}
      />
    </Screen>
  );
}
