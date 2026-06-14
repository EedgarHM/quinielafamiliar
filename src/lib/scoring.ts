import type { Outcome } from "./types";

// Reglas de la quiniela:
//   2 puntos  -> marcador exacto
//   1 punto   -> acertó al ganador (o empate), pero no el marcador exacto
//   0 puntos  -> falló
export const POINTS: Record<Exclude<Outcome, "pending">, number> = {
  exact: 2,
  winner: 1,
  miss: 0,
};

/** Signo del resultado: 1 local gana, -1 visitante gana, 0 empate. */
function sign(home: number, away: number): number {
  return Math.sign(home - away);
}

/**
 * Evalúa un pronóstico contra el resultado real.
 * Si el partido aún no tiene resultado, devuelve "pending" / 0 puntos.
 */
export function evaluate(
  predHome: number,
  predAway: number,
  realHome: number | null,
  realAway: number | null
): { outcome: Outcome; points: number } {
  if (realHome === null || realAway === null) {
    return { outcome: "pending", points: 0 };
  }
  if (predHome === realHome && predAway === realAway) {
    return { outcome: "exact", points: POINTS.exact };
  }
  if (sign(predHome, predAway) === sign(realHome, realAway)) {
    return { outcome: "winner", points: POINTS.winner };
  }
  return { outcome: "miss", points: POINTS.miss };
}
