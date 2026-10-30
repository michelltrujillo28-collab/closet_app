import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// En la web cada pantalla tiene su propia dirección (/login, /registro, /armador...)
const linking: LinkingOptions<any> = {
  prefixes: [],
  config: {
    screens: {
      Landing: '',
      Login: 'login',
      Register: 'registro',
      Home: 'inicio',
      Garments: 'prendas',
      Studio: 'armador',
      Calendar: 'calendario',
      Wishlist: 'deseos',
      Profile: 'perfil',
      Dashboard: 'admin',
      Users: 'admin/usuarios',
      Categories: 'admin/categorias',
      AllGarments: 'admin/prendas',
    },
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer
          linking={Platform.OS === 'web' ? linking : undefined}
          documentTitle={{ formatter: () => 'Closet Virtual' }}
        >
          <AppNavigator />
          <StatusBar style="light" />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
