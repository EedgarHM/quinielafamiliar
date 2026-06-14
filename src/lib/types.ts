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
