import { NextResponse } from "next/server";
import { getResults, setResult, clearResult } from "@/lib/results-store";
import { getMatches } from "@/lib/standings";

export const dynamic = "force-dynamic";

function authorized(req: Request): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false; // sin contraseña configurada, se bloquea
  const header = req.headers.get("authorization") ?? "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  return token === expected;
}

const validMatch = new Set(getMatches().map((m) => m.n));

export async function GET() {
  const results = await getResults();
  return NextResponse.json({ results });
}

export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const { matchN, home, away } = (body ?? {}) as {
    matchN?: number;
    home?: number;
    away?: number;
  };

  if (!validMatch.has(Number(matchN))) {
    return NextResponse.json({ error: "Partido inválido" }, { status: 400 });
  }
  const h = Number(home);
  const a = Number(away);
  if (!Number.isInteger(h) || !Number.isInteger(a) || h < 0 || a < 0 || h > 99 || a > 99) {
    return NextResponse.json({ error: "Marcador inválido" }, { status: 400 });
  }

  await setResult(Number(matchN), h, a);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const matchN = Number(searchParams.get("matchN"));
  if (!validMatch.has(matchN)) {
    return NextResponse.json({ error: "Partido inválido" }, { status: 400 });
  }
  await clearResult(matchN);
  return NextResponse.json({ ok: true });
}
