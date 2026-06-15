import "server-only";
import seedJson from "@/data/seed.json";
import { evaluate } from "./scoring";
import { getResults } from "./results-store";
import type {
  Seed,
  Match,
  ResultsMap,
  StandingRow,
  PredictionDetail,
  MatchView,
  MatchPrediction,
} from "./types";

const seed = seedJson as unknown as Seed;

export function getSeed(): Seed {
  return seed;
}

export function getMatches(): Match[] {
  return seed.matches;
}

const matchByN = new Map(seed.matches.map((m) => [m.n, m]));

/** Calcula la tabla completa de posiciones a partir de los resultados actuales. */
export function computeStandings(results: ResultsMap): StandingRow[] {
  const rows: Omit<StandingRow, "rank">[] = seed.participants.map((p) => {
    let points = 0;
    let exact = 0;
    let winner = 0;
    let miss = 0;
    let played = 0;

    for (const m of seed.matches) {
      const real = results[m.n];
      if (!real) continue; // partido sin resultado: no cuenta
      const pred = p.predictions[String(m.n)];
      if (!pred) continue;
      played++;
      const { outcome, points: pts } = evaluate(
        pred[0],
        pred[1],
        real.home,
        real.away
      );
      points += pts;
      if (outcome === "exact") exact++;
      else if (outcome === "winner") winner++;
      else if (outcome === "miss") miss++;
    }

    return { id: p.id, name: p.name, points, exact, winner, miss, played };
  });

  // Orden: más puntos -> más exactos -> más aciertos de ganador -> nombre
  rows.sort(
    (a, b) =>
      b.points - a.points ||
      b.exact - a.exact ||
      b.winner - a.winner ||
      a.name.localeCompare(b.name)
  );

  // Ranking con empates (mismo puntaje => mismo rank)
  const ranked: StandingRow[] = [];
  let lastPoints = Number.NaN;
  let lastRank = 0;
  rows.forEach((r, i) => {
    const rank = r.points === lastPoints ? lastRank : i + 1;
    lastPoints = r.points;
    lastRank = rank;
    ranked.push({ rank, ...r });
  });

  return ranked;
}

/** Detalle de TODOS los pronósticos de un jugador (para el modal / perfil). */
export function getPlayerDetails(
  participantId: number,
  results: ResultsMap
): PredictionDetail[] {
  const p = seed.participants.find((x) => x.id === participantId);
  if (!p) return [];

  const details: PredictionDetail[] = [];
  for (const m of seed.matches) {
    const pred = p.predictions[String(m.n)];
    if (!pred) continue;
    const real = results[m.n] ?? null;
    const { outcome, points } = evaluate(
      pred[0],
      pred[1],
      real?.home ?? null,
      real?.away ?? null
    );
    details.push({
      matchN: m.n,
      home: m.home,
      away: m.away,
      homeIso: m.homeIso,
      awayIso: m.awayIso,
      predHome: pred[0],
      predAway: pred[1],
      realHome: real?.home ?? null,
      realAway: real?.away ?? null,
      outcome,
      points,
    });
  }
  return details;
}

/** Detalle de los pronósticos de TODOS los participantes para UN partido. */
export function getMatchView(matchN: number, results: ResultsMap): MatchView | null {
  const match = matchByN.get(matchN);
  if (!match) return null;

  const real = results[matchN] ?? null;
  const played = real !== null;

  let exact = 0;
  let winner = 0;
  let miss = 0;

  const predictions: MatchPrediction[] = [];
  for (const p of seed.participants) {
    const pred = p.predictions[String(matchN)];
    if (!pred) continue;
    const { outcome, points } = evaluate(
      pred[0],
      pred[1],
      real?.home ?? null,
      real?.away ?? null
    );
    if (outcome === "exact") exact++;
    else if (outcome === "winner") winner++;
    else if (outcome === "miss") miss++;
    predictions.push({
      participantId: p.id,
      participantName: p.name,
      predHome: pred[0],
      predAway: pred[1],
      outcome,
      points,
    });
  }

  // Jugado: más puntos primero, luego nombre. Pendiente: por nombre.
  predictions.sort(
    (a, b) => b.points - a.points || a.participantName.localeCompare(b.participantName)
  );

  return {
    match,
    realHome: real?.home ?? null,
    realAway: real?.away ?? null,
    played,
    exact,
    winner,
    miss,
    predictions,
  };
}

/** Carga resultados + tabla en una sola llamada de servidor. */
export async function loadStandings() {
  const results = await getResults();
  return { results, standings: computeStandings(results) };
}
