import { NextResponse } from "next/server";
import { getResults } from "@/lib/results-store";
import { computeStandings, getPlayerDetails } from "@/lib/standings";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const participantId = Number(id);
  if (!Number.isInteger(participantId)) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  const results = await getResults();
  const standings = computeStandings(results);
  const row = standings.find((r) => r.id === participantId);
  if (!row) {
    return NextResponse.json({ error: "jugador no encontrado" }, { status: 404 });
  }

  // Todos los pronósticos, ordenados del más nuevo al más viejo:
  // primero los partidos ya jugados (el más reciente arriba), luego los pendientes.
  const all = getPlayerDetails(participantId, results);
  const played = all.filter((d) => d.outcome !== "pending").reverse();
  const pending = all.filter((d) => d.outcome === "pending");
  const predictions = [...played, ...pending];

  return NextResponse.json({ summary: row, predictions });
}
