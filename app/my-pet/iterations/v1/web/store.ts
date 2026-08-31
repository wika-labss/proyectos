import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import {
  createPetInStore,
  emptyStore,
  markAlertSeen,
  reportFound,
  seedDemoStore,
  type AppStore,
  type CreatePetInput,
  type EngineResult,
  type ReportFoundInput,
} from '../src/engine';

function isStore(value: unknown): value is AppStore {
  if (!value || typeof value !== 'object') return false;
  const rec = value as { pets?: unknown; alerts?: unknown };
  return Array.isArray(rec.pets) && Array.isArray(rec.alerts);
}

export class FileStore {
  constructor(private readonly filePath: string) {}

  load(): AppStore {
    if (!existsSync(this.filePath)) {
      const seeded = seedDemoStore();
      this.save(seeded);
      return seeded;
    }
    try {
      const parsed: unknown = JSON.parse(readFileSync(this.filePath, 'utf8'));
      if (!isStore(parsed)) throw new Error('shape');
      if (parsed.pets.length === 0) {
        const seeded = seedDemoStore();
        this.save(seeded);
        return seeded;
      }
      return parsed;
    } catch {
      const seeded = seedDemoStore();
      this.save(seeded);
      return seeded;
    }
  }

  save(store: AppStore): void {
    mkdirSync(dirname(this.filePath), { recursive: true });
    writeFileSync(this.filePath, JSON.stringify(store, null, 2), 'utf8');
  }

  mutate(fn: (store: AppStore) => EngineResult<AppStore>): EngineResult<AppStore> {
    const current = this.load();
    const result = fn(current);
    if (result.ok) this.save(result.state);
    return result;
  }

  addPet(input: CreatePetInput): EngineResult<AppStore> {
    return this.mutate((store) => createPetInStore(store, input));
  }

  addAlert(input: ReportFoundInput): EngineResult<AppStore> {
    return this.mutate((store) => reportFound(store, input));
  }

  seeAlert(alertId: string): EngineResult<AppStore> {
    return this.mutate((store) => markAlertSeen(store, alertId));
  }

  resetDemo(): AppStore {
    const seeded = seedDemoStore();
    this.save(seeded);
    return seeded;
  }

  clearAll(): AppStore {
    const empty = emptyStore();
    this.save(empty);
    return empty;
  }
}
