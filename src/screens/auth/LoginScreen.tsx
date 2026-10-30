import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import PublicTopBar from '../../components/PublicTopBar';
import { Button, Input, Muted } from '../../components/UI';
import { errorMessage, notify } from '../../lib/notify';
import { colors } from '../../theme';
import { AuthStackParamList } from '../../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email || !password) return notify('Faltan datos', 'Ingresa tu correo y contraseña.');
    setLoading(true);
    try {
      const { error } = await signIn(email.trim(), password);
      if (error) notify('No se pudo iniciar sesión', error.message);
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
          <Text style={styles.title}>Iniciar sesión</Text>
          <Muted style={{ textAlign: 'center', marginBottom: 20 }}>Entra para ver tu closet</Muted>
          <Input placeholder="Correo" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <Input placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
          <Button title="Entrar" onPress={onLogin} loading={loading} style={{ marginTop: 6 }} />
          <Button title="Crear cuenta" variant="outline" onPress={() => navigation.navigate('Register')} style={{ marginTop: 10 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  box: { width: '100%', maxWidth: 420, backgroundColor: '#fff', borderRadius: 18, padding: 24 },
  logo: { fontSize: 44, textAlign: 'center' },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center', color: colors.primaryDark, marginBottom: 4 },
});
