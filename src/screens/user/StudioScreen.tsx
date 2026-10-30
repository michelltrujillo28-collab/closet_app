import React, { useMemo, useRef, useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useQuery } from '../../hooks/useQuery';
import { listCategories } from '../../services/categories';
import { listGarments } from '../../services/garments';
import { deleteOutfit, listOutfits, saveOutfit } from '../../services/outfits';
import PhotoCard, { categoryEmoji } from '../../components/PhotoCard';
import { Button, Card, Chips, Empty, Input, Muted, RowItem, Screen, Title, pageContent } from '../../components/UI';
import { confirmAction, errorMessage, notify } from '../../lib/notify';
import { colors } from '../../theme';
import { Category, GarmentWithRel, Outfit } from '../../types';

const OCCASIONS = ['Casual', 'Trabajo', 'Fiesta', 'Deporte'];
const isMulti = (title: string) => /accesor|complement/i.test(title); // en complementos se pueden elegir varios

type Row = { key: string; title: string; items: GarmentWithRel[] };

export default function StudioScreen() {
  const cats = useQuery<Category[]>(listCategories, []);
  const garments = useQuery<GarmentWithRel[]>(listGarments, []);
  const outfits = useQuery<Outfit[]>(listOutfits, []);
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);

  const [selected, setSelected] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [occasion, setOccasion] = useState('');
  const [saving, setSaving] = useState(false);

  // Una fila por categoría (blusas, pantalones, zapatos, complementos...)
  const rows: Row[] = useMemo(() => {
    const result: Row[] = cats.data
      .map((c) => ({ key: c.id, title: c.name, items: garments.data.filter((g) => g.category_id === c.id) }))
      .filter((r) => r.items.length > 0);
    const known = new Set(cats.data.map((c) => c.id));
    const loose = garments.data.filter((g) => !g.category_id || !known.has(g.category_id));
    if (loose.length) result.push({ key: 'none', title: 'Sin categoría', items: loose });
    return result;
  }, [cats.data, garments.data]);

  const chosen = rows.flatMap((r) => r.items.filter((i) => selected.includes(i.id)));

  const toggle = (g: GarmentWithRel, row: Row) =>
    setSelected((prev) => {
      if (prev.includes(g.id)) return prev.filter((x) => x !== g.id);
      const sameRow = row.items.map((i) => i.id);
      const base = isMulti(row.title) ? prev : prev.filter((id) => !sameRow.includes(id));
      return [...base, g.id];
    });

  const reset = () => { setEditingId(null); setName(''); setOccasion(''); setSelected([]); };

  const save = async () => {
    if (selected.length === 0) return notify('Sin prendas', 'Elige al menos una prenda de las filas.');
    if (!name.trim()) return notify('Falta el nombre', 'Ponle un nombre a tu outfit.');
    setSaving(true);
    try {
      await saveOutfit({ id: editingId ?? undefined, name: name.trim(), occasion, garmentIds: selected });
      reset();
      await outfits.reload();
      notify('Listo', 'Outfit guardado');
    } catch (e) {
      notify('No se pudo guardar', errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (o: Outfit) => {
    setEditingId(o.id); setName(o.name); setOccasion(o.occasion ?? '');
    setSelected(o.outfit_items.map((i) => i.garment_id));
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const remove = (o: Outfit) =>
    confirmAction('Eliminar outfit', `¿Eliminar "${o.name}"?`, async () => {
      try { await deleteOutfit(o.id); await outfits.reload(); }
      catch (e) { notify('Error', errorMessage(e)); }
    });

  return (
    <Screen>
      <ScrollView ref={scrollRef} contentContainerStyle={pageContent}>
        {/* Vista previa del outfit */}
        <Card>
          <Title>{editingId ? 'Editando outfit' : 'Tu outfit'}</Title>
          {chosen.length === 0 ? (
            <Muted>Toca las prendas de las filas de abajo para armar tu outfit</Muted>
          ) : (
            <View style={styles.preview}>
              {chosen.map((g) => (
                <PhotoCard key={g.id} uri={g.image_url} label={g.name} width={92} selected />
              ))}
            </View>
          )}
          <Input placeholder="Nombre del outfit" value={name} onChangeText={setName} autoCapitalize="sentences" />
          <Chips
            options={OCCASIONS.map((o) => ({ label: o, value: o }))}
            selected={occasion ? [occasion] : []}
            onToggle={(v) => setOccasion(v === occasion ? '' : v)}
          />
          <Button title={editingId ? 'Guardar cambios' : 'Guardar outfit'} onPress={save} loading={saving} />
          {(editingId || selected.length > 0) && (
            <Button title={editingId ? 'Cancelar edición' : 'Limpiar'} variant="outline" onPress={reset} style={{ marginTop: 10 }} />
          )}
        </Card>

        {/* Filas por categoría */}
        {rows.length === 0 ? (
          <Empty text={garments.loading ? 'Cargando...' : 'Aún no tienes prendas. Agrégalas en la pestaña "Prendas".'} />
        ) : (
          rows.map((row) => (
            <View key={row.key} style={{ marginBottom: 14 }}>
              <Text style={styles.rowTitle}>{categoryEmoji(row.title)} {row.title}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.rowScroll}>
                {row.items.map((g) => (
                  <PhotoCard
                    key={g.id}
                    uri={g.image_url}
                    label={g.name}
                    emoji={categoryEmoji(row.title)}
                    selected={selected.includes(g.id)}
                    onPress={() => toggle(g, row)}
                  />
                ))}
              </ScrollView>
            </View>
          ))
        )}

        {/* Outfits guardados */}
        <Title>Mis outfits ({outfits.data.length})</Title>
        {outfits.data.length === 0 ? (
          <Empty text={outfits.loading ? 'Cargando...' : 'Aún no has guardado outfits.'} />
        ) : (
          outfits.data.map((o) => (
            <RowItem
              key={o.id}
              title={`${o.name}${o.occasion ? ' · ' + o.occasion : ''}`}
              subtitle={o.outfit_items.map((i) => i.garments?.name).filter(Boolean).join(', ')}
              images={o.outfit_items.map((i) => i.garments?.image_url)}
              actions={[
                { label: 'Editar', onPress: () => startEdit(o) },
                { label: 'Eliminar', onPress: () => remove(o), danger: true },
              ]}
            />
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  preview: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  rowTitle: { fontSize: 17, fontWeight: '800', color: colors.primaryDark, marginBottom: 8 },
  rowScroll: { gap: 10, paddingBottom: 8 },
});
