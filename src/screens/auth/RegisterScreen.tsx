import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import PublicTopBar from '../../components/PublicTopBar';
import { Button, Input, Muted } from '../../components/UI';
import { errorMessage, notify } from '../../lib/notify';
import { colors } from '../../theme';
import { AuthStackParamList } from '../../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    if (!name || !email || !password) return notify('Faltan datos', 'Completa todos los campos.');
    if (password.length < 6) return notify('Contraseña corta', 'Debe tener al menos 6 caracteres.');
    setLoading(true);
    try {
      const { data, error } = await signUp(email.trim(), password, name.trim());
      if (error) return notify('No se pudo registrar', error.message);
      if (!data.session) {
        notify('Revisa tu correo', 'Te enviamos un enlace para confirmar tu cuenta.');
        navigation.navigate('Login');
      }
    } catch (e) {
      notify('Error', errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <PublicTopBar />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.box}>
          <Text style={styles.title}>Crear cuenta</Text>
          <Input placeholder="Nombre completo" value={name} onChangeText={setName} autoCapitalize="words" />
          <Input placeholder="Correo" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <Input placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
          <Button title="Registrarme" onPress={onRegister} loading={loading} style={{ marginTop: 6 }} />
          <Button title="Ya tengo cuenta" variant="outline" onPress={() => navigation.navigate('Login')} style={{ marginTop: 10 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  box: { width: '100%', maxWidth: 420, backgroundColor: '#fff', borderRadius: 18, padding: 24 },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center', color: colors.primaryDark, marginBottom: 4 },
});
