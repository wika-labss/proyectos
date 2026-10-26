import type {
  ApiClient,
  Category,
  Match,
  PaymentRecord,
  Player,
} from '../api/types';
import { FORMATION_PRESETS } from './presets';

const CATEGORIES: Category[] = [
  { id: 'cat-primera', name: 'PRIMERA' },
  { id: 'cat-reserva', name: 'RESERVA' },
  { id: 'cat-veteranos', name: 'VETERANOS' },
];

function seedPlayers(): Player[] {
  return [
    {
      id: 'pl-001',
      categoryId: 'cat-primera',
      firstName: 'Martín',
      lastName: 'Ríos',
      nickname: 'Tincho',
      positionCode: 'POR',
      jerseyNumber: 1,
      birthDate: '1990-04-12',
      phone: '+54 11 5555-0101',
      monthlyFee: 15000,
      active: true,
    },
    {
      id: 'pl-002',
      categoryId: 'cat-reserva',
      firstName: 'Lucas',
      lastName: 'Fernández',
      positionCode: 'MC',
      jerseyNumber: 8,
      birthDate: '1998-09-03',
      monthlyFee: 12000,
      active: true,
    },
    {
      id: 'pl-003',
      categoryId: 'cat-veteranos',
      firstName: 'Carlos',
      lastName: 'Méndez',
      nickname: 'Charly',
      positionCode: 'DC',
      jerseyNumber: 9,
      birthDate: '1982-01-20',
      monthlyFee: 10000,
      active: true,
    },
  ];
}

function emptyFormation(presetId: string) {
  const preset = FORMATION_PRESETS.find((p) => p.id === presetId) ?? FORMATION_PRESETS[0];
  return preset.slots.map((s) => ({ slotId: s.id }));
}

function seedMatches(): Match[] {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  return [
    {
      id: 'mt-001',
      categoryId: 'cat-primera',
      opponent: 'Deportivo Norte',
      date: nextWeek.toISOString(),
      venue: 'Estadio Galaxia',
      isHome: true,
      status: 'scheduled',
      lineup: [
        { playerId: 'pl-001', role: 'starter' },
      ],
      formationPresetId: '442',
      formation: emptyFormation('442'),
      payments: [
        {
          id: 'pay-001',
          playerId: 'pl-001',
          amount: 2500,
          paid: false,
          concept: 'Cuota partido',
        },
      ],
      notes: 'Presentarse 45 min antes.',
    },
    {
      id: 'mt-002',
      categoryId: 'cat-reserva',
      opponent: 'Atlético Sur',
      date: lastWeek.toISOString(),
      venue: 'Cancha 2 — Complejo Sur',
      isHome: false,
      status: 'finished',
      goalsFor: 2,
      goalsAgainst: 1,
      lineup: [{ playerId: 'pl-002', role: 'starter' }],
      formationPresetId: '433',
      formation: emptyFormation('433'),
      payments: [
        {
          id: 'pay-002',
          playerId: 'pl-002',
          amount: 2000,
          paid: true,
          paidAt: lastWeek.toISOString(),
          concept: 'Cuota partido',
        },
      ],
    },
    {
      id: 'mt-003',
      categoryId: 'cat-veteranos',
      opponent: 'Old Stars FC',
      date: nextWeek.toISOString(),
      venue: 'Estadio Galaxia',
      isHome: true,
      status: 'scheduled',
      lineup: [{ playerId: 'pl-003', role: 'starter' }],
      formationPresetId: '352',
      formation: emptyFormation('352'),
      payments: [],
    },
  ];
}

function seedPayments(): PaymentRecord[] {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return [
    {
      id: 'hist-001',
      playerId: 'pl-001',
      categoryId: 'cat-primera',
      amount: 15000,
      paidAt: d.toISOString(),
      concept: 'Cuota mensual',
    },
    {
      id: 'hist-002',
      playerId: 'pl-002',
      categoryId: 'cat-reserva',
      amount: 12000,
      paidAt: d.toISOString(),
      concept: 'Cuota mensual',
    },
  ];
}

let players = seedPlayers();
let matches = seedMatches();
let payments = seedPayments();
let playerSeq = 4;
let matchSeq = 4;
let paymentSeq = 3;

export class MockProvider implements ApiClient {
  async listCategories(): Promise<Category[]> {
    return [...CATEGORIES];
  }

  async listPlayers(categoryId: string): Promise<Player[]> {
    return players.filter((p) => p.categoryId === categoryId);
  }

  async getPlayer(id: string): Promise<Player | null> {
    return players.find((p) => p.id === id) ?? null;
  }

  async createPlayer(player: Omit<Player, 'id'>): Promise<Player> {
    const created: Player = { ...player, id: `pl-${String(playerSeq++).padStart(3, '0')}` };
    players = [...players, created];
    return created;
  }

  async updatePlayer(player: Player): Promise<Player> {
    players = players.map((p) => (p.id === player.id ? player : p));
    return player;
  }

  async deletePlayer(id: string): Promise<void> {
    players = players.filter((p) => p.id !== id);
  }

  async listMatches(categoryId: string): Promise<Match[]> {
    return matches
      .filter((m) => m.categoryId === categoryId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getMatch(id: string): Promise<Match | null> {
    return matches.find((m) => m.id === id) ?? null;
  }

  async updateMatch(match: Match): Promise<Match> {
    matches = matches.map((m) => (m.id === match.id ? match : m));
    return match;
  }

  async listPaymentHistory(categoryId: string): Promise<PaymentRecord[]> {
    return payments.filter((p) => p.categoryId === categoryId);
  }

  async listFormationPresets() {
    return [...FORMATION_PRESETS];
  }
}

export function resetMockData(): void {
  players = seedPlayers();
  matches = seedMatches();
  payments = seedPayments();
  playerSeq = 4;
  matchSeq = 4;
  paymentSeq = 3;
}
