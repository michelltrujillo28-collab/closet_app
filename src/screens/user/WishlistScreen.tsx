import React, { useRef, useState } from 'react';
import { FlatList } from 'react-native';
import { useQuery } from '../../hooks/useQuery';
import { createWish, deleteWish, listWishlist, setBought, updateWish } from '../../services/wishlist';
import { Button, Card, Empty, Input, RowItem, Screen, Title, pageContent } from '../../components/UI';
import { confirmAction, errorMessage, notify } from '../../lib/notify';
import { WishItem } from '../../types';

export default function WishlistScreen() {
  const wishes = useQuery<WishItem[]>(listWishlist, []);
  const listRef = useRef<FlatList<WishItem>>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [store, setStore] = useState('');
  const [price, setPrice] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => { setEditingId(null); setName(''); setStore(''); setPrice(''); };

  const save = async () => {
    if (!name.trim()) return notify('Falta el nombre', 'Que deseas?');
    const priceNumber = price.trim() ? Number(price.replace(',', '.')) : null;
    if (priceNumber !== null && Number.isNaN(priceNumber)) return notify('Precio inválido', 'Usa solo números.');
    setSaving(true);
    try {
      const input = { name: name.trim(), store: store.trim(), price: priceNumber };
      if (editingId) await updateWish(editingId, input);
      else await createWish(input);
      reset();
      await wishes.reload();
    } catch (e) {
      notify('No se pudo guardar', errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (w: WishItem) => {
    setEditingId(w.id); setName(w.name); setStore(w.store ?? ''); setPrice(w.price !== null ? String(w.price) : '');
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const toggle = async (w: WishItem) => {
    try { await setBought(w.id, !w.bought); await wishes.reload(); }
    catch (e) { notify('Error', errorMessage(e)); }
  };

  const remove = (w: WishItem) =>
    confirmAction('Eliminar', `¿Quitar "${w.name}" de tu lista?`, async () => {
      try { await deleteWish(w.id); await wishes.reload(); }
      catch (e) { notify('Error', errorMessage(e)); }
    });

  const header = (
    <>
      <Card>
        <Title>{editingId ? 'Editar deseo' : 'Agregar a mi lista de deseos'}</Title>
        <Input placeholder="¿Qué quieres comprar?" value={name} onChangeText={setName} autoCapitalize="sentences" />
        <Input placeholder="Tienda" value={store} onChangeText={setStore} autoCapitalize="words" />
        <Input placeholder="Precio aproximado" value={price} onChangeText={setPrice} keyboardType="numeric" />
        <Button title={editingId ? 'Guardar cambios' : 'Guardar'} onPress={save} loading={saving} />
        {editingId && <Button title="Cancelar" variant="outline" onPress={reset} style={{ marginTop: 10 }} />}
      </Card>
      <Title>Mi lista ({wishes.data.length})</Title>
    </>
  );

  return (
    <Screen>
      <FlatList
        ref={listRef}
        data={wishes.data}
        keyExtractor={(w) => w.id}
        ListHeaderComponent={header}
        ListEmptyComponent={<Empty text={wishes.loading ? 'Cargando...' : 'Tu lista está vacía.'} />}
        contentContainerStyle={pageContent}
        renderItem={({ item }) => (
          <RowItem
            title={`${item.bought ? ' ' : ''}${item.name}`}
            subtitle={[item.store, item.price !== null && `$${item.price}`].filter(Boolean).join(' · ') || undefined}
            actions={[
              { label: item.bought ? 'Marcar pendiente' : 'Marcar comprado', onPress: () => toggle(item) },
              { label: 'Editar', onPress: () => startEdit(item) },
              { label: 'Eliminar', onPress: () => remove(item), danger: true },
            ]}
          />
        )}
      />
    </Screen>
  );
}
