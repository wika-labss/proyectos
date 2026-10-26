import type {
  ApiClient,
  Category,
  FormationPreset,
  Match,
  PaymentRecord,
  Player,
} from '../api/types';

export class HttpProvider implements ApiClient {
  constructor(private readonly baseUrl: string) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl.replace(/\/$/, '')}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }
    if (res.status === 204) {
      return undefined as T;
    }
    return (await res.json()) as T;
  }

  listCategories(): Promise<Category[]> {
    return this.request<Category[]>('/categories');
  }

  listPlayers(categoryId: string): Promise<Player[]> {
    return this.request<Player[]>(`/categories/${categoryId}/players`);
  }

  getPlayer(id: string): Promise<Player | null> {
    return this.request<Player | null>(`/players/${id}`);
  }

  createPlayer(player: Omit<Player, 'id'>): Promise<Player> {
    return this.request<Player>('/players', { method: 'POST', body: JSON.stringify(player) });
  }

  updatePlayer(player: Player): Promise<Player> {
    return this.request<Player>(`/players/${player.id}`, {
      method: 'PUT',
      body: JSON.stringify(player),
    });
  }

  deletePlayer(id: string): Promise<void> {
    return this.request<void>(`/players/${id}`, { method: 'DELETE' });
  }

  listMatches(categoryId: string): Promise<Match[]> {
    return this.request<Match[]>(`/categories/${categoryId}/matches`);
  }

  getMatch(id: string): Promise<Match | null> {
    return this.request<Match | null>(`/matches/${id}`);
  }

  updateMatch(match: Match): Promise<Match> {
    return this.request<Match>(`/matches/${match.id}`, {
      method: 'PUT',
      body: JSON.stringify(match),
    });
  }

  listPaymentHistory(categoryId: string): Promise<PaymentRecord[]> {
    return this.request<PaymentRecord[]>(`/categories/${categoryId}/payments`);
  }

  listFormationPresets(): Promise<FormationPreset[]> {
    return this.request<FormationPreset[]>('/formation-presets');
  }
}
