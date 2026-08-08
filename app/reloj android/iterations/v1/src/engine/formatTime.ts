import type { ClockPreferences, FormattedClock } from '../types';

const DAY_NAMES = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

export function formatClock(date: Date, preferences: ClockPreferences): FormattedClock {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  let displayHours = hours;
  let ampm: string | null = null;

  if (!preferences.format24h) {
    ampm = hours >= 12 ? 'PM' : 'AM';
    displayHours = hours % 12 || 12;
  }

  const hh = String(displayHours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  const time = preferences.showSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;

  const day = DAY_NAMES[date.getDay()];
  const dd = String(date.getDate()).padStart(2, '0');
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();

  return {
    time,
    ampm,
    date: `${day} ${dd}/${mo}/${yyyy}`,
  };
}

export function formatWidgetTime(date: Date, preferences: ClockPreferences): string {
  const formatted = formatClock(date, { ...preferences, showSeconds: false });
  if (formatted.ampm) {
    return `${formatted.time} ${formatted.ampm}`;
  }
  return formatted.time;
}
