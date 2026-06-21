"use client";

import { useMemo, useRef, useState } from "react";
import Flag from "./Flag";
import MatchModal from "./MatchModal";
import { formatDateShort, formatDateLong, todayISO, shiftISO } from "@/lib/format";
import type { Match, ResultsMap } from "@/lib/types";

export default function MatchExplorer({
  matches,
  results,
}: {
  matches: Match[];
  results: ResultsMap;
}) {
  const [openN, setOpenN] = useState<number | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  const playedCount = useMemo(
    () => matches.filter((m) => results[m.n]).length,
    [matches, results]
  );

  // Día previo con partidos (idealmente ayer; si ayer no hubo, la última jornada
  // jugada) y sus 4 partidos más recientes (mayor número = más tarde).
  const recent = useMemo(() => {
    const today = todayISO();
    const pastDates = [...new Set(matches.map((m) => m.date))]
      .filter((d) => d < today)
      .sort();
    const lastDay = pastDates[pastDates.length - 1] ?? null;
    if (!lastDay) return { day: null as string | null, items: [] as Match[] };
    const items = matches
      .filter((m) => m.date === lastDay)
      .sort((a, b) => b.n - a.n)
      .slice(0, 4);
    return { day: lastDay, items };
  }, [matches]);

  const recentIsYesterday = recent.day === shiftISO(todayISO(), -1);

  const scrollBy = (dir: 1 | -1) => {
    scroller.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <section className="mb-12">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.25em] text-white/50">
          <span className="h-px w-6 bg-gradient-to-r from-neon to-transparent" />
          Pronósticos por partido
        </h2>
        <div className="flex items-center gap-2">
          <span className="hidden text-[11px] text-white/35 sm:inline">
            {playedCount}/{matches.length} jugados
          </span>
          <button
            onClick={() => scrollBy(-1)}
            aria-label="Anterior"
            className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            ‹
          </button>
          <button
            onClick={() => scrollBy(1)}
            aria-label="Siguiente"
            className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            ›
          </button>
        </div>
      </div>

      {/* Destacado: los 4 más recientes del día anterior (recién jugados) */}
      {recent.day && recent.items.length > 0 && (
        <div className="mb-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm">🕘</span>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60">
              {recentIsYesterday ? "Resultados de ayer" : "Última jornada"}
            </h3>
            <span className="text-[11px] text-white/35">· {formatDateLong(recent.day)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {recent.items.map((m) => (
              <MatchCard
                key={m.n}
                match={m}
                real={results[m.n]}
                onClick={() => setOpenN(m.n)}
                className="w-full"
                highlight
              />
            ))}
          </div>
        </div>
      )}

      <p className="mb-3 text-xs text-white/40">
        Desliza y toca un partido para ver los pronósticos de todos los participantes.
      </p>

      <div
        ref={scroller}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-width:thin]"
      >
        {matches.map((m) => (
          <MatchCard
            key={m.n}
            match={m}
            real={results[m.n]}
            onClick={() => setOpenN(m.n)}
            className="w-40 shrink-0 snap-start"
          />
        ))}
      </div>

      <MatchModal matchN={openN} onClose={() => setOpenN(null)} />
    </section>
  );
}

function MatchCard({
  match: m,
  real,
  onClick,
  className = "",
  highlight = false,
}: {
  match: Match;
  real: { home: number; away: number } | undefined;
  onClick: () => void;
  className?: string;
  highlight?: boolean;
}) {
  const played = Boolean(real);
  return (
    <button
      onClick={onClick}
      className={`glass glass-hover group relative rounded-2xl p-3 text-left transition ${
        played ? "ring-1 ring-neon2/30" : ""
      } ${highlight && played ? "ring-neon2/50" : ""} ${className}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">
          P{m.n} · {formatDateShort(m.date)}
        </span>
        {played ? (
          <span className="rounded-full bg-neon2/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-neon2">
            Final
          </span>
        ) : (
          <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-white/35">
            Próx.
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Flag iso={m.homeIso} name={m.home} size="sm" />
        <span className="min-w-0 flex-1 truncate text-xs text-white/80">{m.home}</span>
        <span className="shrink-0 font-mono text-xs font-bold text-white/70">
          {played ? real!.home : "–"}
        </span>
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <Flag iso={m.awayIso} name={m.away} size="sm" />
        <span className="min-w-0 flex-1 truncate text-xs text-white/80">{m.away}</span>
        <span className="shrink-0 font-mono text-xs font-bold text-white/70">
          {played ? real!.away : "–"}
        </span>
      </div>
    </button>
  );
}
