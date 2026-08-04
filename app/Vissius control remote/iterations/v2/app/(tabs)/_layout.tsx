import React from 'react';
import { Tabs } from 'expo-router';
import { colors } from '../../src/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.backgroundStrong },
        headerTintColor: colors.textOnStrong,
        headerTitleStyle: { fontWeight: '700' },
        tabBarStyle: {
          backgroundColor: colors.backgroundSoft,
          borderTopColor: colors.backgroundStrong,
          borderTopWidth: 2,
          minHeight: 56,
        },
        tabBarActiveBackgroundColor: colors.backgroundStrong,
        tabBarInactiveBackgroundColor: colors.backgroundSoft,
        tabBarActiveTintColor: colors.textOnStrong,
        tabBarInactiveTintColor: colors.textOnSoft,
        tabBarLabelStyle: { fontSize: 14, fontWeight: '600' },
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
