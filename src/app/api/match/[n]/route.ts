import { NextResponse } from "next/server";
import { getResults } from "@/lib/results-store";
import { getMatchView } from "@/lib/standings";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ n: string }> }
) {
  const { n } = await params;
  const matchN = Number(n);
  if (!Number.isInteger(matchN)) {
    return NextResponse.json({ error: "número de partido inválido" }, { status: 400 });
  }

  const results = await getResults();
  const view = getMatchView(matchN, results);
  if (!view) {
    return NextResponse.json({ error: "partido no encontrado" }, { status: 404 });
  }

  return NextResponse.json(view);
}
