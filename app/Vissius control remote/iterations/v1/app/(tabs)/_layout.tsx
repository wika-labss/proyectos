import React from 'react';
import { Tabs } from 'expo-router';
import { colors } from '../../src/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.backgroundStrong },
        headerTintColor: colors.textOnStrong,
        tabBarStyle: { backgroundColor: colors.backgroundStrong },
        tabBarActiveTintColor: colors.textOnStrong,
        tabBarInactiveTintColor: colors.backgroundSoft,
        sceneStyle: { backgroundColor: colors.backgroundSoft },
      }}
    >
      <Tabs.Screen
        name="remote"
        options={{
          title: 'Mando',
          tabBarLabel: 'Mando',
        }}
      />
      <Tabs.Screen
        name="apps"
        options={{
          title: 'Apps',
          tabBarLabel: 'Apps',
        }}
      />
    </Tabs>
  );
}
