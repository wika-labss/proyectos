export type CategoryId = string;
export type PlayerId = string;
export type MatchId = string;

export interface Category {
  id: CategoryId;
  name: string;
}

export interface Player {
  id: PlayerId;
  categoryId: CategoryId;
  firstName: string;
  lastName: string;
  nickname?: string;
  positionCode: string;
  jerseyNumber?: number;
  birthDate?: string;
  phone?: string;
  email?: string;
  monthlyFee?: number;
  active: boolean;
  notes?: string;
}

export type MatchStatus = 'scheduled' | 'in_progress' | 'finished' | 'cancelled';

export type LineupRole = 'starter' | 'substitute' | 'absent';

export interface LineupEntry {
  playerId: PlayerId;
  role: LineupRole;
}

export interface FormationSlot {
  id: string;
  label: string;
  positionCode: string;
  x: number;
  y: number;
}

export interface FormationPreset {
  id: string;
  name: string;
  slots: FormationSlot[];
}

export interface FormationAssignment {
  slotId: string;
  playerId?: PlayerId;
}

export interface MatchPayment {
  id: string;
  playerId: PlayerId;
  amount: number;
  paid: boolean;
  paidAt?: string;
  concept: string;
}

export interface Match {
  id: MatchId;
  categoryId: CategoryId;
  opponent: string;
  date: string;
  venue: string;
  isHome: boolean;
  status: MatchStatus;
  goalsFor?: number;
  goalsAgainst?: number;
  lineup: LineupEntry[];
  formationPresetId?: string;
  formation: FormationAssignment[];
  payments: MatchPayment[];
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  playerId: PlayerId;
  categoryId: CategoryId;
  amount: number;
  paidAt: string;
  concept: string;
  matchId?: MatchId;
}

export interface ApiClient {
  listCategories(): Promise<Category[]>;
  listPlayers(categoryId: CategoryId): Promise<Player[]>;
  getPlayer(id: PlayerId): Promise<Player | null>;
  createPlayer(player: Omit<Player, 'id'>): Promise<Player>;
  updatePlayer(player: Player): Promise<Player>;
  deletePlayer(id: PlayerId): Promise<void>;
  listMatches(categoryId: CategoryId): Promise<Match[]>;
  getMatch(id: MatchId): Promise<Match | null>;
  updateMatch(match: Match): Promise<Match>;
  listPaymentHistory(categoryId: CategoryId): Promise<PaymentRecord[]>;
  listFormationPresets(): Promise<FormationPreset[]>;
}
