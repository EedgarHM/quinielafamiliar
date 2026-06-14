"use client";

import { useState } from "react";
import PlayerModal from "./PlayerModal";
import type { StandingRow } from "@/lib/types";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard({ standings }: { standings: StandingRow[] }) {
  const [openId, setOpenId] = useState<number | null>(null);
  const top5 = standings.slice(0, 5);

  return (
    <>
      {/* ---------- Podio Top 5 ---------- */}
      <section className="mb-12">
        <h2 className="mb-5 flex items-center gap-2 text-sm font-medium uppercase tracking-[0.25em] text-white/50">
          <span className="h-px w-6 bg-gradient-to-r from-neon to-transparent" />
          Top 5
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {top5.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setOpenId(p.id)}
              style={{ animationDelay: `${i * 60}ms` }}
              className={`glass glass-hover animate-rise group relative overflow-hidden rounded-2xl p-4 text-left ${
                i === 0 ? "col-span-2 sm:col-span-3 lg:col-span-1" : ""
              }`}
            >
              {/* halo del primer lugar */}
              {i === 0 && (
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-winner/20 blur-2xl" />
              )}
              <div className="mb-3 flex items-center justify-between">
                <span className="text-2xl">{MEDALS[i] ?? ""}</span>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] font-medium text-white/50">
                  #{p.rank}
                </span>
              </div>
              <div className="truncate text-base font-semibold leading-snug" title={p.name}>
                {p.name}
              </div>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-3xl font-bold text-gradient">{p.points}</span>
                <span className="mb-1 text-xs text-white/40">pts</span>
              </div>
              <div className="mt-2 flex items-center gap-3 text-[11px] text-white/55">
                <span className="flex items-center gap-1">
                  <span className="dot dot-exact" />
                  {p.exact}
                </span>
                <span className="flex items-center gap-1">
                  <span className="dot dot-winner" />
                  {p.winner}
                </span>
                <span className="flex items-center gap-1">
                  <span className="dot dot-miss" />
                  {p.miss}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ---------- Tabla completa ---------- */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.25em] text-white/50">
            <span className="h-px w-6 bg-gradient-to-r from-neon to-transparent" />
            Tabla general
          </h2>
          <Legend />
        </div>

        <div className="glass overflow-hidden rounded-2xl">
          {/* cabecera */}
          <div className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 border-b border-white/8 px-4 py-3 text-[11px] uppercase tracking-wider text-white/40 sm:grid-cols-[2.5rem_1fr_repeat(4,3rem)_3.5rem]">
            <span className="text-center">#</span>
            <span>Participante</span>
            <span className="hidden text-center sm:block" title="Marcadores exactos">
              Exa
            </span>
            <span className="hidden text-center sm:block" title="Acertó ganador">
              Gan
            </span>
            <span className="hidden text-center sm:block" title="Falló">
              Fal
            </span>
            <span className="hidden text-center sm:block" title="Partidos jugados">
              PJ
            </span>
            <span className="text-right">Pts</span>
          </div>

          {/* filas */}
          <div className="divide-y divide-white/5">
            {standings.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setOpenId(p.id)}
                style={{ animationDelay: `${Math.min(i, 20) * 25}ms` }}
                className="animate-rise grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-3 px-4 py-3 text-left transition hover:bg-white/[0.04] sm:grid-cols-[2.5rem_1fr_repeat(4,3rem)_3.5rem]"
              >
                <span className="text-center">
                  <RankBadge rank={p.rank} />
                </span>
                <span className="flex min-w-0 items-center gap-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/5 text-[11px] font-medium text-white/45">
                    {p.id}
                  </span>
                  <span className="truncate font-medium">{p.name}</span>
                </span>
                <span className="hidden text-center text-sm text-exact sm:block">{p.exact}</span>
                <span className="hidden text-center text-sm text-winner sm:block">{p.winner}</span>
                <span className="hidden text-center text-sm text-miss sm:block">{p.miss}</span>
                <span className="hidden text-center text-sm text-white/40 sm:block">
                  {p.played}
                </span>
                <span className="text-right text-lg font-bold tabular-nums text-gradient">
                  {p.points}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <PlayerModal playerId={openId} onClose={() => setOpenId(null)} />
    </>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-lg">🥇</span>;
  if (rank === 2) return <span className="text-lg">🥈</span>;
  if (rank === 3) return <span className="text-lg">🥉</span>;
  return <span className="text-sm font-semibold text-white/50">{rank}</span>;
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/45">
      <span className="flex items-center gap-1.5">
        <span className="dot dot-exact" /> Exacto · 2
      </span>
      <span className="flex items-center gap-1.5">
        <span className="dot dot-winner" /> Ganador · 1
      </span>
      <span className="flex items-center gap-1.5">
        <span className="dot dot-miss" /> Falló · 0
      </span>
    </div>
  );
}
