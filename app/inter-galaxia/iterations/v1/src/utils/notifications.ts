import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function ensureNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('match-reminders', {
      name: 'Recordatorios de partido',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleMatchReminder(
  matchId: string,
  opponent: string,
  when: Date,
): Promise<string | null> {
  const ok = await ensureNotificationPermissions();
  if (!ok) return null;
  const triggerDate = new Date(when.getTime() - 60 * 60 * 1000);
  if (triggerDate.getTime() <= Date.now()) return null;
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Inter Galaxia DT',
      body: `En 1 hora: partido vs ${opponent}`,
      data: { matchId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });
}
