import React, { useRef, useState } from 'react';
import { FlatList } from 'react-native';
import { useQuery } from '../../hooks/useQuery';
import { createCategory, deleteCategory, listCategories, updateCategory } from '../../services/categories';
import { Button, Card, Empty, Input, RowItem, Screen, Title, pageContent } from '../../components/UI';
import { confirmAction, errorMessage, notify } from '../../lib/notify';
import { Category } from '../../types';

export default function CategoriesScreen() {
  const cats = useQuery<Category[]>(listCategories, []);
  const listRef = useRef<FlatList<Category>>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => { setEditingId(null); setName(''); };

  const save = async () => {
    if (!name.trim()) return notify('Falta el nombre', 'Escribe el nombre de la categoría.');
    setSaving(true);
    try {
      if (editingId) await updateCategory(editingId, name.trim());
      else await createCategory(name.trim());
      reset();
      await cats.reload();
    } catch (e) {
      notify('No se pudo guardar', errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = (c: Category) =>
    confirmAction('Eliminar categoría', `¿Eliminar "${c.name}"? Las prendas quedarán sin categoría.`, async () => {
      try { await deleteCategory(c.id); await cats.reload(); }
      catch (e) { notify('Error', errorMessage(e)); }
    });

  const header = (
    <>
      <Card>
        <Title>{editingId ? 'Editar categoría' : 'Nueva categoría'}</Title>
        <Input placeholder="Nombre (ej: Abrigos)" value={name} onChangeText={setName} autoCapitalize="sentences" />
        <Button title={editingId ? 'Guardar cambios' : 'Crear'} onPress={save} loading={saving} />
        {editingId && <Button title="Cancelar" variant="outline" onPress={reset} style={{ marginTop: 10 }} />}
      </Card>
      <Title>Categorías ({cats.data.length})</Title>
    </>
  );

  return (
    <Screen>
      <FlatList
        ref={listRef}
        data={cats.data}
        keyExtractor={(c) => c.id}
        contentContainerStyle={pageContent}
        ListHeaderComponent={header}
        ListEmptyComponent={<Empty text={cats.loading ? 'Cargando...' : 'No hay categorías.'} />}
        renderItem={({ item }) => (
          <RowItem
            title={item.name}
            actions={[
              { label: 'Editar', onPress: () => { setEditingId(item.id); setName(item.name); listRef.current?.scrollToOffset({ offset: 0, animated: true }); } },
              { label: 'Eliminar', onPress: () => remove(item), danger: true },
            ]}
          />
        )}
      />
    </Screen>
  );
}
