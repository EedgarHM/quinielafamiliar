"use client";

import { useEffect, useState } from "react";
import Flag from "./Flag";
import { formatDateLong } from "@/lib/format";
import type { MatchView, Outcome } from "@/lib/types";

const OUTCOME_META: Record<
  Outcome,
  { label: string; dot: string; text: string; ring: string }
> = {
  exact: { label: "Exacto", dot: "dot-exact", text: "text-exact", ring: "ring-exact/40" },
  winner: { label: "Ganador", dot: "dot-winner", text: "text-winner", ring: "ring-winner/40" },
  miss: { label: "Falló", dot: "dot-miss", text: "text-miss", ring: "ring-miss/40" },
  pending: { label: "Pendiente", dot: "dot-pending", text: "text-white/40", ring: "ring-white/10" },
};

export default function MatchModal({
  matchN,
  onClose,
}: {
  matchN: number | null;
  onClose: () => void;
}) {
  const [data, setData] = useState<MatchView | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (matchN == null) return;
    setData(null);
    setLoading(true);
    const ctrl = new AbortController();
    fetch(`/api/match/${matchN}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d: MatchView) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [matchN]);

  // Cerrar con Escape
  useEffect(() => {
    if (matchN == null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [matchN, onClose]);

  if (matchN == null) return null;

  const m = data?.match;
  const hasResult = data?.played ?? false;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className="animate-rise relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0b0d1c]/97 p-6 shadow-[0_24px_80px_-20px_rgba(124,92,255,0.55)] backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          ✕
        </button>

        {/* Encabezado del partido */}
        <div className="mb-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-[0.2em] text-neon2/80">
              Partido #{matchN}
            </p>
            {m && (
              <p className="text-[11px] text-white/45">
                📅 {formatDateLong(m.date)}
              </p>
            )}
          </div>
          {m ? (
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center">
                <Flag iso={m.homeIso} name={m.home} size="lg" />
                <span className="truncate text-sm font-medium text-white/85" title={m.home}>
                  {m.home}
                </span>
              </div>
              <div className="shrink-0 text-center">
                {hasResult ? (
                  <span className="font-mono text-2xl font-bold text-gradient">
                    {data!.realHome}-{data!.realAway}
                  </span>
                ) : (
                  <span className="text-xs uppercase tracking-wider text-white/35">
                    vs
                  </span>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center">
                <Flag iso={m.awayIso} name={m.away} size="lg" />
                <span className="truncate text-sm font-medium text-white/85" title={m.away}>
                  {m.away}
                </span>
              </div>
            </div>
          ) : (
            <h3 className="mt-3 text-center text-base text-white/40">Cargando…</h3>
          )}
        </div>

        {/* Resumen de aciertos (solo si ya se jugó) */}
        {data && hasResult && (
          <div className="mb-5 grid grid-cols-3 gap-2 text-center">
            <Stat label="Exactos" value={data.exact} accent="text-exact" />
            <Stat label="Ganador" value={data.winner} accent="text-winner" />
            <Stat label="Fallaron" value={data.miss} accent="text-miss" />
          </div>
        )}
        {data && !hasResult && (
          <div className="mb-3 rounded-xl bg-white/[0.03] py-2.5 text-center text-xs text-white/45 ring-1 ring-white/5">
            ⏳ Partido sin resultado todavía
          </div>
        )}

        {/* Pronóstico más popular (consenso de la familia) */}
        {data?.topPrediction && (
          <div className="mb-5 flex items-center justify-center gap-2 rounded-xl bg-neon2/[0.07] py-2.5 text-center text-xs text-white/65 ring-1 ring-neon2/20">
            <span>🔥 Lo más pronosticado:</span>
            <span className="font-mono text-sm font-bold text-neon2">
              {data.topPrediction.home}-{data.topPrediction.away}
            </span>
            <span className="text-white/40">
              ({data.topPrediction.count}{" "}
              {data.topPrediction.count === 1 ? "persona" : "personas"})
            </span>
          </div>
        )}

        {/* Lista de pronósticos de todos los participantes */}
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-white/50">
            Pronósticos
          </p>
          {data && (
            <span className="text-[11px] text-white/35">
              {data.predictions.length} participantes
            </span>
          )}
        </div>
        <div className="max-h-[48vh] space-y-2 overflow-y-auto pr-1">
          {loading && !data && (
            <div className="py-6 text-center text-sm text-white/40">Cargando…</div>
          )}
          {data?.predictions.map((p) => {
            const meta = OUTCOME_META[p.outcome];
            return (
              <div
                key={p.participantId}
                className={`flex items-center gap-3 rounded-xl bg-white/[0.03] p-2.5 ring-1 ${meta.ring}`}
              >
                <span className={`dot ${meta.dot} shrink-0`} />
                <span className="min-w-0 flex-1 truncate text-sm text-white/85">
                  {p.participantName}
                </span>
                <span className={`shrink-0 font-mono text-sm ${meta.text}`}>
                  {p.predHome}-{p.predAway}
                </span>
                {hasResult && (
                  <span
                    className="w-9 shrink-0 text-right text-xs font-semibold tabular-nums text-white/55"
                    title="Puntos obtenidos"
                  >
                    +{p.points}
                  </span>
                )}
              </div>
            );
          })}
          {data && data.predictions.length === 0 && (
            <div className="py-6 text-center text-sm text-white/40">
              Sin pronósticos para este partido.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div className="rounded-xl bg-white/[0.04] py-2.5 ring-1 ring-white/5">
      <div className={`text-xl font-bold ${accent}`}>{value}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-white/45">{label}</div>
    </div>
  );
}
