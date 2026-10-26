import React from 'react';
import { NavigationContainer, DarkTheme, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList, RootStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { PlayerListScreen } from '../screens/PlayerListScreen';
import { PlayerFormScreen } from '../screens/PlayerFormScreen';
import { PlayerDetailScreen } from '../screens/PlayerDetailScreen';
import { MatchListScreen } from '../screens/MatchListScreen';
import { MatchDetailScreen } from '../screens/MatchDetailScreen';
import { PaymentHistoryScreen } from '../screens/PaymentHistoryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const navTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#FFD54F',
    background: '#0D3B1E',
    card: '#1B5E20',
    text: '#E8F5E9',
    border: '#2E7D32',
  },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1B5E20', borderTopColor: '#2E7D32' },
        tabBarActiveTintColor: '#FFD54F',
        tabBarInactiveTintColor: '#A5D6A7',
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="Players" component={PlayerListScreen} options={{ title: 'Plantel' }} />
      <Tab.Screen name="Matches" component={MatchListScreen} options={{ title: 'Partidos' }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#1B5E20' },
          headerTintColor: '#E8F5E9',
          contentStyle: { backgroundColor: '#E8F5E9' },
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="PlayerDetail" component={PlayerDetailScreen} options={{ title: 'Jugador' }} />
        <Stack.Screen name="PlayerForm" component={PlayerFormScreen} options={{ title: 'Editar jugador' }} />
        <Stack.Screen name="MatchDetail" component={MatchDetailScreen} options={{ title: 'Partido' }} />
        <Stack.Screen
          name="PaymentHistory"
          component={PaymentHistoryScreen}
          options={{ title: 'Historial de pagos' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
