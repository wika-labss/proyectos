export type RootStackParamList = {
  MainTabs: undefined;
  PlayerDetail: { playerId: string };
  PlayerForm: { playerId?: string };
  MatchDetail: { matchId: string };
  PaymentHistory: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Players: undefined;
  Matches: undefined;
};
