import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { CategoryProvider } from './src/context/CategoryContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ensureNotificationPermissions } from './src/utils/notifications';

export default function App() {
  useEffect(() => {
    void ensureNotificationPermissions();
  }, []);

  return (
    <CategoryProvider>
      <RootNavigator />
      <StatusBar style="light" />
    </CategoryProvider>
  );
}
