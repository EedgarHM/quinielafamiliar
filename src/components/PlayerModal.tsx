"use client";

import { useEffect, useState } from "react";
import Flag from "./Flag";
import { shareText } from "@/lib/share";
import type { PredictionDetail, StandingRow, Outcome } from "@/lib/types";

const OUTCOME_META: Record<
  Outcome,
  { label: string; dot: string; text: string; ring: string }
> = {
  exact: { label: "Exacto", dot: "dot-exact", text: "text-exact", ring: "ring-exact/40" },
  winner: { label: "Ganador", dot: "dot-winner", text: "text-winner", ring: "ring-winner/40" },
  miss: { label: "Falló", dot: "dot-miss", text: "text-miss", ring: "ring-miss/40" },
  pending: { label: "Pendiente", dot: "dot-pending", text: "text-white/40", ring: "ring-white/10" },
};

type PlayerData = { summary: StandingRow; predictions: PredictionDetail[] };

export default function PlayerModal({
  playerId,
  onClose,
  isMe = false,
  onToggleMe,
}: {
  playerId: number | null;
  onClose: () => void;
  isMe?: boolean;
  onToggleMe?: (id: number) => void;
}) {
  const [data, setData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (playerId == null) return;
    setData(null);
    setLoading(true);
    const ctrl = new AbortController();
    fetch(`/api/player/${playerId}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d: PlayerData) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [playerId]);

  // Cerrar con Escape
  useEffect(() => {
    if (playerId == null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playerId, onClose]);

  if (playerId == null) return null;

  const s = data?.summary;

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

        {/* Encabezado */}
        <div className="mb-5">
          <p className="text-xs uppercase tracking-[0.2em] text-neon2/80">
            Jugador #{s?.id ?? playerId}
          </p>
          <h3 className="mt-1 text-2xl font-bold leading-tight">
            {s?.name ?? <span className="text-white/40">Cargando…</span>}
          </h3>
        </div>

        {/* Resumen de puntaje */}
        {s && (
          <div className="mb-6 grid grid-cols-4 gap-2 text-center">
            <Stat label="Puntos" value={s.points} accent="text-gradient" big />
            <Stat label="Exactos" value={s.exact} accent="text-exact" />
            <Stat label="Ganador" value={s.winner} accent="text-winner" />
            <Stat label="Lugar" value={`#${s.rank}`} accent="text-white" />
          </div>
        )}

        {/* Acciones: marcarme como "yo" y compartir */}
        {s && (
          <div className="mb-6 grid grid-cols-2 gap-2">
            <button
              onClick={() => onToggleMe?.(s.id)}
              className={`rounded-xl py-2.5 text-sm font-semibold transition ${
                isMe
                  ? "bg-neon/20 text-neon2 ring-1 ring-neon/40"
                  : "bg-white/5 text-white/70 ring-1 ring-white/10 hover:bg-white/10"
              }`}
            >
              {isMe ? "★ Este eres tú" : "Este soy yo"}
            </button>
            <button
              onClick={() =>
                shareText(
                  `🏆 Quiniela Mundial 2026\n\n${s.name} va en el lugar #${s.rank} con ${s.points} pts (${s.exact} exactos, ${s.winner} de ganador).`
                )
              }
              className="rounded-xl bg-[#25D366] py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              📲 Compartir
            </button>
          </div>
        )}

        {/* Todos los pronósticos (nuevo → viejo) */}
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-white/50">
            Todos los pronósticos
          </p>
          {data && (
            <span className="text-[11px] text-white/35">
              {data.predictions.length} · nuevo → viejo
            </span>
          )}
        </div>
        <div className="max-h-[48vh] space-y-2 overflow-y-auto pr-1">
          {loading && !data && (
            <div className="py-6 text-center text-sm text-white/40">Cargando…</div>
          )}
          {data?.predictions.map((d) => {
            const m = OUTCOME_META[d.outcome];
            const hasResult = d.realHome !== null && d.realAway !== null;
            return (
              <div
                key={d.matchN}
                className={`flex items-center gap-3 rounded-xl bg-white/[0.03] p-2.5 ring-1 ${m.ring}`}
              >
                <span className={`dot ${m.dot} shrink-0`} />
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <Flag iso={d.homeIso} name={d.home} size="sm" />
                  <span className="truncate text-sm text-white/80">{d.home}</span>
                </div>
                <div className="shrink-0 text-center font-mono text-sm">
                  <span className={m.text}>
                    {d.predHome}-{d.predAway}
                  </span>
                  {hasResult && (
                    <span className="ml-1 text-[11px] text-white/40">
                      (real {d.realHome}-{d.realAway})
                    </span>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                  <span className="truncate text-right text-sm text-white/80">{d.away}</span>
                  <Flag iso={d.awayIso} name={d.away} size="sm" />
                </div>
              </div>
            );
          })}
          {data && data.predictions.length === 0 && (
            <div className="py-6 text-center text-sm text-white/40">
              Sin pronósticos.
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
  big = false,
}: {
  label: string;
  value: number | string;
  accent: string;
  big?: boolean;
}) {
  return (
    <div className="rounded-xl bg-white/[0.04] py-2.5 ring-1 ring-white/5">
      <div className={`font-bold ${accent} ${big ? "text-2xl" : "text-xl"}`}>{value}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-white/45">{label}</div>
    </div>
  );
}
