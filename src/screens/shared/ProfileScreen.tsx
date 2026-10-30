import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { updateProfileName } from '../../services/profiles';
import { Button, Card, Input, Muted, Screen, Title, pageContent } from '../../components/UI';
import { errorMessage, notify } from '../../lib/notify';

export default function ProfileScreen() {
  const { profile, signOut, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.full_name ?? '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!profile) return;
    if (!name.trim()) return notify('Falta el nombre', 'Escribe tu nombre.');
    setSaving(true);
    try {
      await updateProfileName(profile.id, name.trim());
      await refreshProfile();
      notify('Listo', 'Perfil actualizado.');
    } catch (e) {
      notify('No se pudo guardar', errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={pageContent}>
        <Card>
          <Title>Mi perfil</Title>
          <Muted style={{ marginBottom: 4 }}>Correo: {profile?.email}</Muted>
          <Muted style={{ marginBottom: 12 }}>Rol: {profile?.role === 'admin' ? 'Administrador' : 'Usuario'}</Muted>
          <Input placeholder="Nombre completo" value={name} onChangeText={setName} autoCapitalize="words" />
          <Button title="Guardar cambios" onPress={save} loading={saving} />
        </Card>
        <Button title="Cerrar sesión" variant="danger" onPress={signOut} />
      </ScrollView>
    </Screen>
  );
}
