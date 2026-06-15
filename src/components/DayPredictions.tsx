"use client";

import { useEffect, useMemo, useState } from "react";
import Flag from "./Flag";
import { formatDateLong } from "@/lib/format";
import type { Match, PredictionDetail, Outcome } from "@/lib/types";

const RING: Record<Outcome, string> = {
  exact: "ring-exact/40",
  winner: "ring-winner/40",
  miss: "ring-miss/40",
  pending: "ring-white/10",
};
const TEXT: Record<Outcome, string> = {
  exact: "text-exact",
  winner: "text-winner",
  miss: "text-miss",
  pending: "text-white/80",
};

function todayISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function DayPredictions({
  matches,
  meId,
}: {
  matches: Match[];
  meId: number | null;
}) {
  // Día objetivo: hoy si hay partidos; si no, la próxima jornada con partidos.
  const { targetDate, isToday } = useMemo(() => {
    const today = todayISO();
    const dates = [...new Set(matches.map((m) => m.date))].sort();
    if (dates.includes(today)) return { targetDate: today, isToday: true };
    const next = dates.find((d) => d > today) ?? null;
    return { targetDate: next, isToday: false };
  }, [matches]);

  const dayMatches = useMemo(
    () =>
      matches
        .filter((m) => m.date === targetDate)
        .sort((a, b) => a.n - b.n),
    [matches, targetDate]
  );

  const [preds, setPreds] = useState<Record<number, PredictionDetail> | null>(null);

  useEffect(() => {
    if (meId == null) {
      setPreds(null);
      return;
    }
    const ctrl = new AbortController();
    fetch(`/api/player/${meId}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d: { predictions: PredictionDetail[] }) => {
        const map: Record<number, PredictionDetail> = {};
        for (const p of d.predictions ?? []) map[p.matchN] = p;
        setPreds(map);
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [meId]);

  if (!targetDate || dayMatches.length === 0) return null;

  return (
    <section className="mb-10 glass rounded-2xl p-5">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xl">📅</span>
        <h2 className="text-lg font-bold text-white/90">
          Tus pronósticos · {isToday ? "hoy" : formatDateLong(targetDate)}
        </h2>
      </div>
      <p className="mb-4 text-xs text-white/40">
        {isToday ? "Partidos de hoy" : "Próxima jornada"} · {dayMatches.length} partidos
        {!isToday && ` · ${formatDateLong(targetDate)}`}
      </p>

      {meId == null && (
        <div className="mb-4 rounded-xl bg-neon/[0.07] px-3 py-2.5 text-xs text-white/60 ring-1 ring-neon/20">
          💡 Márcate como <strong className="text-neon2">“tú”</strong> (toca tu nombre en la
          tabla → “Este soy yo”) para ver aquí tu pronóstico de cada partido.
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        {dayMatches.map((m) => {
          const p = preds?.[m.n];
          const outcome: Outcome = p?.outcome ?? "pending";
          const hasResult = p?.realHome != null && p?.realAway != null;
          return (
            <div
              key={m.n}
              className={`rounded-xl bg-white/[0.03] p-3 ring-1 ${RING[outcome]}`}
            >
              <div className="flex items-center gap-2">
                <Flag iso={m.homeIso} name={m.home} size="sm" />
                <span className="min-w-0 flex-1 truncate text-sm text-white/80">
                  {m.home}
                </span>
                <span className={`shrink-0 font-mono text-sm font-bold ${TEXT[outcome]}`}>
                  {p ? `${p.predHome}-${p.predAway}` : "—"}
                </span>
                <span className="min-w-0 flex-1 truncate text-right text-sm text-white/80">
                  {m.away}
                </span>
                <Flag iso={m.awayIso} name={m.away} size="sm" />
              </div>
              {hasResult && (
                <div className="mt-1.5 text-center text-[11px] text-white/40">
                  Resultado {p!.realHome}-{p!.realAway} · +{p!.points}{" "}
                  {p!.points === 1 ? "pt" : "pts"}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
