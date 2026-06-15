// Tipos centrales de la Quiniela

export type Match = {
  n: number;
  home: string;
  away: string;
  homeIso: string;
  awayIso: string;
};

export type Participant = {
  id: number;
  name: string;
  // clave = número de partido (string en JSON), valor = [golesLocal, golesVisitante]
  predictions: Record<string, [number, number]>;
};

export type Seed = {
  tournament: string;
  prize: string;
  matches: Match[];
  participants: Participant[];
};

// Resultado real de un partido (capturado por el admin)
export type Result = { home: number; away: number };
export type ResultsMap = Record<number, Result>;

// Estado del pronóstico de un jugador frente al resultado real
export type Outcome = "exact" | "winner" | "miss" | "pending";

export type PredictionDetail = {
  matchN: number;
  home: string;
  away: string;
  homeIso: string;
  awayIso: string;
  predHome: number;
  predAway: number;
  realHome: number | null;
  realAway: number | null;
  outcome: Outcome;
  points: number;
};

export type StandingRow = {
  rank: number;
  id: number;
  name: string;
  points: number;
  exact: number; // # de marcadores exactos
  winner: number; // # de aciertos de ganador/empate
  miss: number; // # de fallos
  played: number; // partidos ya jugados
};

// Pronóstico de un participante para UN partido concreto
export type MatchPrediction = {
  participantId: number;
  participantName: string;
  predHome: number;
  predAway: number;
  outcome: Outcome;
  points: number;
};

// Vista de un partido con los pronósticos de TODOS los participantes
export type MatchView = {
  match: Match;
  realHome: number | null;
  realAway: number | null;
  played: boolean;
  // conteos rápidos (solo si el partido ya tiene resultado)
  exact: number;
  winner: number;
  miss: number;
  // marcador más pronosticado por la familia (consenso)
  topPrediction: { home: number; away: number; count: number } | null;
  predictions: MatchPrediction[];
};
