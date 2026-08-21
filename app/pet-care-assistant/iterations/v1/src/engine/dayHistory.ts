import type { AppState, CareEvent, DaySummary, StoolCode } from './types';
import { eventDateKey } from './types';

export function getDaySummary(state: AppState, petId: string, dateKey: string): DaySummary {
  const events = state.events
    .filter((e) => e.petId === petId && eventDateKey(e.at) === dateKey)
    .slice()
    .sort((a, b) => a.at.localeCompare(b.at));

  let lastStool: StoolCode | undefined;
  for (let i = events.length - 1; i >= 0; i -= 1) {
    const e = events[i]!;
    if (e.kind === 'bathroom' && e.payload.stool) {
      lastStool = e.payload.stool;
      break;
    }
  }

  const preventivesApplied = state.preventives.filter(
    (p) => p.petId === petId && p.appliedAt === dateKey,
  );

  return {
    date: dateKey,
    petId,
    feedCount: events.filter((e) => e.kind === 'feed').length,
    bathroomCount: events.filter((e) => e.kind === 'bathroom').length,
    walkCount: events.filter((e) => e.kind === 'walk').length,
    noteCount: events.filter((e) => e.kind === 'note').length,
    lastStool,
    health: state.healthByPetId[petId],
    events,
    preventivesApplied,
  };
}

export function describeEvent(event: CareEvent): string {
  switch (event.kind) {
    case 'feed':
      return `Comida · ${event.payload.foodType}${
        event.payload.amountLabel ? ` (${event.payload.amountLabel})` : ''
      }`;
    case 'bathroom': {
      const stool = event.payload.stool ? ` · ${event.payload.stool}` : '';
      return `Baño · ${event.payload.bathroomType}${stool}`;
    }
    case 'walk':
      return `Paseo${
        event.payload.durationMin != null ? ` · ${event.payload.durationMin} min` : ''
      }`;
    case 'note':
      return `Nota · ${event.payload.text}`;
    case 'health':
      return `Salud · ${event.payload.status}${
        event.payload.symptoms.length ? ` (${event.payload.symptoms.join(', ')})` : ''
      }`;
    default:
      return 'Evento';
  }
}
