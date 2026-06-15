"use client";

import type { StandingRow } from "@/lib/types";

const STYLES = {
  1: {
    medal: "🥇",
    ring: "ring-winner/50",
    glow: "shadow-[0_0_40px_-8px_rgba(245,200,66,0.55)]",
    grad: "from-amber-300 to-yellow-500",
    pedestal: "from-amber-400/25 to-amber-500/5 ring-winner/30",
    height: "h-24 sm:h-28",
    width: "w-28 sm:w-36",
    avatar: "h-16 w-16 sm:h-20 sm:w-20 text-xl",
    pts: "text-3xl sm:text-4xl",
  },
  2: {
    medal: "🥈",
    ring: "ring-slate-300/40",
    glow: "shadow-[0_0_28px_-10px_rgba(203,213,225,0.45)]",
    grad: "from-slate-200 to-slate-400",
    pedestal: "from-slate-300/20 to-slate-400/5 ring-slate-300/25",
    height: "h-16 sm:h-20",
    width: "w-24 sm:w-32",
    avatar: "h-14 w-14 sm:h-16 sm:w-16 text-lg",
    pts: "text-2xl sm:text-3xl",
  },
  3: {
    medal: "🥉",
    ring: "ring-orange-400/40",
    glow: "shadow-[0_0_28px_-10px_rgba(251,146,60,0.45)]",
    grad: "from-orange-300 to-amber-700",
    pedestal: "from-orange-400/20 to-orange-500/5 ring-orange-400/25",
    height: "h-12 sm:h-16",
    width: "w-24 sm:w-32",
    avatar: "h-14 w-14 sm:h-16 sm:w-16 text-lg",
    pts: "text-2xl sm:text-3xl",
  },
} as const;

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function PodiumColumn({
  row,
  place,
  onClick,
  isMe,
}: {
  row: StandingRow;
  place: 1 | 2 | 3;
  onClick: () => void;
  isMe: boolean;
}) {
  const s = STYLES[place];
  return (
    <div className={`flex flex-col items-center ${s.width}`}>
      <button
        onClick={onClick}
        className="group flex w-full flex-col items-center focus:outline-none"
      >
        {place === 1 && <div className="mb-1 text-2xl sm:text-3xl">👑</div>}

        {/* Avatar con iniciales */}
        <div
          className={`relative grid ${s.avatar} place-items-center rounded-full bg-gradient-to-br ${s.grad} font-black text-[#0b0d1c] ring-2 ${s.ring} ${s.glow} transition group-hover:scale-105`}
        >
          {initials(row.name)}
          <span className="absolute -bottom-1 -right-1 text-lg sm:text-xl">
            {s.medal}
          </span>
          {isMe && (
            <span className="absolute -top-1 -left-1 grid h-5 w-5 place-items-center rounded-full bg-neon text-[10px] text-white ring-2 ring-[#0b0d1c]">
              ★
            </span>
          )}
        </div>

        {/* Nombre + puntos */}
        <div
          className="mt-2 max-w-full truncate text-center text-xs font-semibold text-white/90 sm:text-sm"
          title={row.name}
        >
          {row.name}
        </div>
        <div className={`mt-0.5 font-black leading-none text-gradient ${s.pts}`}>
          {row.points}
        </div>
        <div className="text-[10px] uppercase tracking-wider text-white/40">pts</div>
      </button>

      {/* Pedestal */}
      <div
        className={`mt-3 grid w-full ${s.height} place-items-center rounded-t-xl bg-gradient-to-b ${s.pedestal} ring-1`}
      >
        <span className="text-2xl font-black text-white/30 sm:text-3xl">{place}</span>
      </div>
    </div>
  );
}

export default function Podium({
  standings,
  onSelect,
  meId,
}: {
  standings: StandingRow[];
  onSelect: (id: number) => void;
  meId: number | null;
}) {
  const top3 = standings.slice(0, 3);
  if (top3.length === 0) return null;

  const first = top3[0];
  const second = top3[1];
  const third = top3[2];

  return (
    <section className="mb-12">
      <h2 className="mb-6 flex items-center gap-2 text-sm font-medium uppercase tracking-[0.25em] text-white/50">
        <span className="h-px w-6 bg-gradient-to-r from-neon to-transparent" />
        Podio
      </h2>
      <div className="glass relative overflow-hidden rounded-3xl px-3 py-6 sm:px-6">
        {/* halos de fondo */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-winner/10 blur-3xl" />
        <div className="relative flex items-end justify-center gap-2 sm:gap-5">
          {second && (
            <PodiumColumn
              row={second}
              place={2}
              onClick={() => onSelect(second.id)}
              isMe={meId === second.id}
            />
          )}
          {first && (
            <PodiumColumn
              row={first}
              place={1}
              onClick={() => onSelect(first.id)}
              isMe={meId === first.id}
            />
          )}
          {third && (
            <PodiumColumn
              row={third}
              place={3}
              onClick={() => onSelect(third.id)}
              isMe={meId === third.id}
            />
          )}
        </div>
      </div>
    </section>
  );
}
