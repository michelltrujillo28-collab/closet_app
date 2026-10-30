import React from 'react';
import { ActivityIndicator, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import { AdminTabParamList, AuthStackParamList, UserTabParamList } from '../types';

import LandingScreen from '../screens/public/LandingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/user/HomeScreen';
import GarmentsScreen from '../screens/user/GarmentsScreen';
import StudioScreen from '../screens/user/StudioScreen';
import WishlistScreen from '../screens/user/WishlistScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import DashboardScreen from '../screens/admin/DashboardScreen';
import UsersScreen from '../screens/admin/UsersScreen';
import CategoriesScreen from '../screens/admin/CategoriesScreen';
import AllGarmentsScreen from '../screens/admin/AllGarmentsScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const UserTab = createBottomTabNavigator<UserTabParamList>();
const AdminTab = createBottomTabNavigator<AdminTabParamList>();

// Acciones de la barra superior: perfil y "Salir" (visibles en todas las pantallas)
function HeaderActions({ onProfile }: { onProfile: () => void }) {
  const { signOut, profile } = useAuth();
  const { width } = useWindowDimensions();
  const first = profile?.full_name?.split(' ')[0] ?? 'Perfil';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 16 }}>
      <Pressable onPress={onProfile}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>{width > 500 ? first : 'Perfil'}</Text>
      </Pressable>
      <Pressable onPress={signOut}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Salir</Text>
      </Pressable>
    </View>
  );
}

// En pantallas anchas (web) las secciones van arriba; en celular, abajo
function useScreenOptions() {
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  return ({ navigation }: { navigation: any }) => ({
    headerTitle: 'Closet Virtual',
    headerStyle: { backgroundColor: colors.primary },
    headerTintColor: '#fff',
    headerTitleStyle: { fontWeight: '800' as const },
    headerRight: () => <HeaderActions onProfile={() => navigation.navigate('Profile')} />,
    tabBarActiveTintColor: colors.primary,
    tabBarIconStyle: { display: 'none' as const },
    tabBarLabelStyle: { fontSize: 14, fontWeight: '600' as const },
    tabBarPosition: wide ? ('top' as const) : ('bottom' as const),
  });
}

const tab = (title: string) => ({
  title,
  headerTitle: 'Closet Virtual',
  tabBarIcon: () => null,
});

// El perfil se abre desde la barra superior, no ocupa lugar en las pestañas
const hiddenTab = {
  title: 'Perfil',
  tabBarButton: () => null,
  tabBarItemStyle: { display: 'none' as const },
};

function UserTabs() {
  const screenOptions = useScreenOptions();
  return (
    <UserTab.Navigator screenOptions={screenOptions}>
      <UserTab.Screen name="Home" component={HomeScreen} options={tab('Inicio')} />
      <UserTab.Screen name="Garments" component={GarmentsScreen} options={tab('Prendas')} />
      <UserTab.Screen name="Studio" component={StudioScreen} options={tab('Armador')} />
      <UserTab.Screen name="Wishlist" component={WishlistScreen} options={tab('Deseos')} />
      <UserTab.Screen name="Profile" component={ProfileScreen} options={hiddenTab} />
    </UserTab.Navigator>
  );
}

function AdminTabs() {
  const screenOptions = useScreenOptions();
  return (
    <AdminTab.Navigator screenOptions={screenOptions}>
      <AdminTab.Screen name="Dashboard" component={DashboardScreen} options={tab('Resumen')} />
      <AdminTab.Screen name="Users" component={UsersScreen} options={tab('Usuarios')} />
      <AdminTab.Screen name="Categories" component={CategoriesScreen} options={tab('Categorías')} />
      <AdminTab.Screen name="AllGarments" component={AllGarmentsScreen} options={tab('Prendas')} />
      <AdminTab.Screen name="Profile" component={ProfileScreen} options={hiddenTab} />
    </AdminTab.Navigator>
  );
}

export default function AppNavigator() {
  const { session, profile, loading } = useAuth();

  if (loading || (session && !profile)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Rutas protegidas: sin sesión solo existen Inicio (landing), Login y Registro
  if (!session) {
    return (
      <AuthStack.Navigator initialRouteName="Landing" screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Landing" component={LandingScreen} />
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="Register" component={RegisterScreen} />
      </AuthStack.Navigator>
    );
  }

  return profile?.role === 'admin' ? <AdminTabs /> : <UserTabs />;
}
