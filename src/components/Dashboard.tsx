"use client";

import { useEffect, useMemo, useState } from "react";
import PlayerModal from "./PlayerModal";
import Podium from "./Podium";
import MatchExplorer from "./MatchExplorer";
import DayPredictions from "./DayPredictions";
import { shareText } from "@/lib/share";
import { formatDateShort } from "@/lib/format";
import type { Match, ResultsMap, StandingRow } from "@/lib/types";

const ME_KEY = "quiniela:meId";

function norm(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export default function Dashboard({
  standings,
  matches,
  results,
  played,
  total,
}: {
  standings: StandingRow[];
  matches: Match[];
  results: ResultsMap;
  played: number;
  total: number;
}) {
  const [openId, setOpenId] = useState<number | null>(null);
  const [meId, setMeId] = useState<number | null>(null);
  const [query, setQuery] = useState("");

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
      {/* Tu posición (banner personal) */}
      {meRow && (
        <div className="mb-10 glass flex items-center gap-3 rounded-2xl p-4 ring-1 ring-neon/40">
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
      )}

      {/* Tus pronósticos del día */}
      <DayPredictions matches={matches} meId={meId} />

      {/* Pronósticos por partido (slider) */}
      <div className="mb-8">
        <MatchExplorer matches={matches} results={results} />
      </div>

      {/* Progreso del torneo */}
      <div className="mb-10">
        <ProgressCompact played={played} total={total} />
      </div>

      {/* Podio + Tabla (principal) · Datos (sidebar) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        <div className="space-y-12 lg:col-span-8">
          {/* Podio */}
          <Podium standings={standings} onSelect={setOpenId} meId={meId} />

          {/* Tabla general */}
          <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-white/90">Tabla general</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={shareStandings}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
              title="Compartir en WhatsApp"
            >
              📲 Compartir
            </button>
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
        </div>

        {/* Sidebar: datos + cómo se puntúa */}
        <aside className="space-y-4 lg:col-span-4 lg:sticky lg:top-6">
          <QuickStats
            standings={standings}
            played={played}
            total={total}
            firstDate={matches[0]?.date ?? null}
          />
          <ScoringRules />
        </aside>
      </div>

      <PlayerModal
        playerId={openId}
        onClose={() => setOpenId(null)}
        isMe={openId != null && openId === meId}
        onToggleMe={toggleMe}
      />
    </>
  );
}

function ProgressCompact({ played, total }: { played: number; total: number }) {
  const pct = total > 0 ? Math.round((played / total) * 100) : 0;
  return (
    <section className="glass rounded-2xl p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">
          Progreso del torneo
        </h2>
        <span className="text-sm font-semibold tabular-nums">
          <span className="text-gradient">{played}</span>
          <span className="text-white/40">/{total}</span>
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/[0.06] ring-1 ring-white/5">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-neon via-neon2 to-exact transition-[width] duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] text-white/40">
        {pct}% completado · faltan {total - played}
      </p>
    </section>
  );
}

function QuickStats({
  standings,
  played,
  total,
  firstDate,
}: {
  standings: StandingRow[];
  played: number;
  total: number;
  firstDate: string | null;
}) {
  const leader = standings[0];
  const hasPoints = leader && leader.points > 0;
  const exactKing = standings.reduce<StandingRow | null>(
    (best, r) => (r.exact > (best?.exact ?? 0) ? r : best),
    null
  );
  const avg =
    standings.length > 0
      ? (standings.reduce((s, r) => s + r.points, 0) / standings.length).toFixed(1)
      : "0";

  return (
    <section className="glass rounded-2xl p-4">
      <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-white/50">
        En números
      </h2>
      <ul className="space-y-2.5 text-sm">
        <StatRow icon="🥇" label="Líder">
          {hasPoints ? `${leader.name} · ${leader.points}` : "Aún nadie"}
        </StatRow>
        <StatRow icon="🎯" label="Más exactos">
          {exactKing && exactKing.exact > 0
            ? `${exactKing.name} · ${exactKing.exact}`
            : "Aún nadie"}
        </StatRow>
        <StatRow icon="📊" label="Promedio">{`${avg} pts`}</StatRow>
        <StatRow icon="⚽" label="Faltan">{`${total - played} partidos`}</StatRow>
        {firstDate && played === 0 && (
          <StatRow icon="📅" label="Arranca">{formatDateShort(firstDate)}</StatRow>
        )}
      </ul>
    </section>
  );
}

function StatRow({
  icon,
  label,
  children,
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-2">
      <span className="shrink-0">{icon}</span>
      <span className="text-white/50">{label}</span>
      <span className="ml-auto min-w-0 truncate pl-2 text-right font-semibold text-white/85">
        {children}
      </span>
    </li>
  );
}

function ScoringRules() {
  return (
    <section className="glass rounded-2xl p-4">
      <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-white/50">
        ¿Cómo se puntúa?
      </h2>
      <ul className="space-y-2.5">
        <Rule dot="dot-exact" pts="2" accent="text-exact" title="Resultado exacto">
          Aciertas el marcador idéntico.
        </Rule>
        <Rule dot="dot-winner" pts="1" accent="text-winner" title="Ganador correcto">
          Aciertas quién gana o el empate, sin el marcador.
        </Rule>
        <Rule dot="dot-miss" pts="0" accent="text-miss" title="Incorrecto">
          No aciertas ni ganador ni empate.
        </Rule>
      </ul>
    </section>
  );
}

function Rule({
  dot,
  pts,
  accent,
  title,
  children,
}: {
  dot: string;
  pts: string;
  accent: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-2.5">
      <span className={`dot ${dot} mt-1 shrink-0`} />
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold">{title}</span>
          <span className={`text-xs font-bold ${accent}`}>
            {pts} {pts === "1" ? "pt" : "pts"}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] leading-snug text-white/45">{children}</p>
      </div>
    </li>
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
