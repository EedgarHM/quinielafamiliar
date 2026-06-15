"use client";

import { useEffect, useMemo, useState } from "react";
import PlayerModal from "./PlayerModal";
import Podium from "./Podium";
import { shareText } from "@/lib/share";
import type { StandingRow } from "@/lib/types";

const ME_KEY = "quiniela:meId";

function norm(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export default function Leaderboard({ standings }: { standings: StandingRow[] }) {
  const [openId, setOpenId] = useState<number | null>(null);
  const [meId, setMeId] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  // cargar "yo" del navegador
  useEffect(() => {
    const raw = localStorage.getItem(ME_KEY);
    if (raw != null) setMeId(Number(raw));
  }, []);

  const toggleMe = (id: number) => {
    setMeId((prev) => {
      const next = prev === id ? null : id;
      if (next == null) localStorage.removeItem(ME_KEY);
      else localStorage.setItem(ME_KEY, String(next));
      return next;
    });
  };

  const meRow = useMemo(
    () => standings.find((r) => r.id === meId) ?? null,
    [standings, meId]
  );

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return standings;
    return standings.filter((r) => norm(r.name).includes(q));
  }, [standings, query]);

  const shareStandings = () => {
    const top = standings.slice(0, 5);
    const medals = ["🥇", "🥈", "🥉", "4.", "5."];
    const lines = top.map((r, i) => `${medals[i]} ${r.name} — ${r.points} pts`);
    let msg = `🏆 Quiniela Mundial 2026 — Tabla general\n\n${lines.join("\n")}`;
    if (meRow) msg += `\n\nVoy en el lugar #${meRow.rank} con ${meRow.points} pts 💪`;
    shareText(msg);
  };

  return (
    <>
      {/* ---------- Podio Top 3 ---------- */}
      <Podium standings={standings} onSelect={setOpenId} meId={meId} />

      {/* ---------- Tarjeta "Tú" ---------- */}
      {meRow && (
        <section className="mb-6">
          <div className="glass flex items-center gap-3 rounded-2xl p-4 ring-1 ring-neon/40">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-neon to-neon2 text-sm font-bold text-white">
              ★
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-wider text-neon2/80">Tu posición</p>
              <p className="truncate font-semibold">{meRow.name}</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gradient">#{meRow.rank}</div>
              <div className="text-[10px] uppercase tracking-wider text-white/40">lugar</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gradient">{meRow.points}</div>
              <div className="text-[10px] uppercase tracking-wider text-white/40">pts</div>
            </div>
            <button
              onClick={shareStandings}
              className="shrink-0 rounded-full bg-[#25D366] px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
              title="Compartir en WhatsApp"
            >
              Compartir
            </button>
          </div>
        </section>
      )}

      {/* ---------- Tabla completa ---------- */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.25em] text-white/50">
            <span className="h-px w-6 bg-gradient-to-r from-neon to-transparent" />
            Tabla general
          </h2>
          <div className="flex items-center gap-2">
            {!meRow && (
              <button
                onClick={shareStandings}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                title="Compartir en WhatsApp"
              >
                📲 Compartir
              </button>
            )}
            <Legend />
          </div>
        </div>

        {/* buscador */}
        <div className="relative mb-3">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
            🔍
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busca tu nombre…"
            className="w-full rounded-xl bg-white/[0.04] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/30 ring-1 ring-white/10 transition focus:outline-none focus:ring-neon/50"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Limpiar"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              ✕
            </button>
          )}
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
            {filtered.map((p, i) => {
              const isMe = p.id === meId;
              return (
                <button
                  key={p.id}
                  onClick={() => setOpenId(p.id)}
                  style={{ animationDelay: `${Math.min(i, 20) * 25}ms` }}
                  className={`animate-rise grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-3 px-4 py-3 text-left transition hover:bg-white/[0.04] sm:grid-cols-[2.5rem_1fr_repeat(4,3rem)_3.5rem] ${
                    isMe ? "bg-neon/[0.08] ring-1 ring-inset ring-neon/40" : ""
                  }`}
                >
                  <span className="text-center">
                    <RankBadge rank={p.rank} />
                  </span>
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/5 text-[11px] font-medium text-white/45">
                      {p.id}
                    </span>
                    <span className="truncate font-medium">{p.name}</span>
                    {isMe && (
                      <span className="shrink-0 rounded-full bg-neon/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-neon2">
                        Tú
                      </span>
                    )}
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
              );
            })}
            {filtered.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-white/40">
                Nadie coincide con “{query}”.
              </div>
            )}
          </div>
        </div>
      </section>

      <PlayerModal
        playerId={openId}
        onClose={() => setOpenId(null)}
        isMe={openId != null && openId === meId}
        onToggleMe={toggleMe}
      />
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
