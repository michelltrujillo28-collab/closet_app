import React, { useRef, useState } from 'react';
import { FlatList, Image, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '../../hooks/useQuery';
import { listCategories } from '../../services/categories';
import { createGarment, deleteGarment, listGarments, updateGarment } from '../../services/garments';
import { uploadGarmentImage } from '../../services/storage';
import { Button, Card, Chips, Empty, Input, RowItem, Screen, Title, pageContent } from '../../components/UI';
import { PickedImage, pickImage } from '../../lib/images';
import { confirmAction, errorMessage, notify } from '../../lib/notify';
import { colors } from '../../theme';
import { Category, GarmentWithRel } from '../../types';

export default function GarmentsScreen() {
  const { profile } = useAuth();
  const cats = useQuery<Category[]>(listCategories, []);
  const garments = useQuery<GarmentWithRel[]>(listGarments, []);
  const listRef = useRef<FlatList<GarmentWithRel>>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [picked, setPicked] = useState<PickedImage | null>(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setEditingId(null); setName(''); setColor(''); setSize(''); setBrand('');
    setCategoryId(null); setCurrentImage(null); setPicked(null);
  };

  const choosePhoto = async () => {
    try {
      const img = await pickImage();
      if (img) setPicked(img);
    } catch (e) {
      notify('No se pudo abrir la galería', errorMessage(e));
    }
  };

  const save = async () => {
    if (!profile) return;
    if (!name.trim()) return notify('Falta el nombre', ' Nombre de la prenda.');
    setSaving(true);
    try {
      let image_url = currentImage;
      if (picked) image_url = await uploadGarmentImage(profile.id, picked);
      const input = {
        name: name.trim(), category_id: categoryId, color: color.trim(),
        size: size.trim(), brand: brand.trim(), image_url,
      };
      if (editingId) await updateGarment(editingId, input);
      else await createGarment(input);
      reset();
      await garments.reload();
    } catch (e) {
      notify('No se pudo guardar', errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (g: GarmentWithRel) => {
    setEditingId(g.id); setName(g.name); setColor(g.color ?? ''); setSize(g.size ?? '');
    setBrand(g.brand ?? ''); setCategoryId(g.category_id); setCurrentImage(g.image_url); setPicked(null);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const remove = (g: GarmentWithRel) =>
    confirmAction('Eliminar prenda', `¿Eliminar "${g.name}"?`, async () => {
      try { await deleteGarment(g.id); await garments.reload(); }
      catch (e) { notify('Error', errorMessage(e)); }
    });

  const visible = garments.data.filter((g) => g.name.toLowerCase().includes(search.trim().toLowerCase()));
  const preview = picked?.uri ?? currentImage;

  const header = (
    <>
      <Card>
        <Title>{editingId ? 'Editar prenda' : 'Agregar prenda'}</Title>
        {!!preview && (
          <Image source={{ uri: preview }} style={{ width: 120, height: 150, borderRadius: 12, marginBottom: 10, backgroundColor: colors.border }} />
        )}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
          <Button title={preview ? ' Cambiar foto' : ' Elegir foto'} variant="outline" onPress={choosePhoto} />
          {!!preview && (
            <Button title="Quitar foto" variant="outline" onPress={() => { setPicked(null); setCurrentImage(null); }} />
          )}
        </View>
        <Input placeholder="Nombre" value={name} onChangeText={setName} autoCapitalize="sentences" />
        <Input placeholder="Color" value={color} onChangeText={setColor} />
        <Input placeholder="Talla" value={size} onChangeText={setSize} autoCapitalize="characters" />
        <Input placeholder="Marca" value={brand} onChangeText={setBrand} autoCapitalize="words" />
        <Chips
          options={cats.data.map((c) => ({ label: c.name, value: c.id }))}
          selected={categoryId ? [categoryId] : []}
          onToggle={(v) => setCategoryId(v === categoryId ? null : v)}
        />
        <Button title={editingId ? 'Guardar cambios' : 'Guardar'} onPress={save} loading={saving} />
        {editingId && <Button title="Cancelar" variant="outline" onPress={reset} style={{ marginTop: 10 }} />}
      </Card>
      <Title>Mis prendas ({garments.data.length})</Title>
      <Input placeholder="Buscar por nombre" value={search} onChangeText={setSearch} />
    </>
  );

  return (
    <Screen>
      <FlatList
        ref={listRef}
        data={visible}
        keyExtractor={(g) => g.id}
        ListHeaderComponent={header}
        ListEmptyComponent={<Empty text={garments.loading ? 'Cargando...' : 'No hay prendas para mostrar.'} />}
        contentContainerStyle={pageContent}
        renderItem={({ item }) => (
          <RowItem
            title={item.name}
            imageUrl={item.image_url}
            subtitle={[item.categories?.name ?? 'Sin categoría', item.color, item.size && `Talla ${item.size}`, item.brand]
              .filter(Boolean).join(' · ')}
            actions={[
              { label: 'Editar', onPress: () => startEdit(item) },
              { label: 'Eliminar', onPress: () => remove(item), danger: true },
            ]}
          />
        )}
      />
    </Screen>
  );
}
