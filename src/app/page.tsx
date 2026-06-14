import Link from "next/link";
import Leaderboard from "@/components/Leaderboard";
import { getSeed, loadStandings } from "@/lib/standings";

export const dynamic = "force-dynamic";

export default async function Home() {
  const seed = getSeed();
  const { results, standings } = await loadStandings();
  const totalMatches = seed.matches.length;
  const playedMatches = Object.keys(results).length;

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:py-14">
      {/* Encabezado */}
      <header className="mb-12 text-center">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.4em] text-neon2/80">
          Quiniela
        </p>
        <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
          <span className="text-gradient">MUNDIAL 2026</span>
        </h1>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm">
          <Pill>
            🏆 Premio <strong className="ml-1 text-winner">{seed.prize}</strong>
          </Pill>
          <Pill>👥 {standings.length} participantes</Pill>
          <Pill>💵 Costo $300</Pill>
          <Pill>
            ⚽ {playedMatches}/{totalMatches} partidos
          </Pill>
        </div>
        <div className="mt-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-neon to-neon2 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_rgba(124,92,255,0.7)] transition hover:opacity-90"
          >
            ⚙️ Capturar resultados
          </Link>
        </div>
      </header>

      {/* Cómo se puntúa */}
      <section className="glass mb-12 rounded-2xl p-5">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-white/55">
          ¿Cómo se puntúa?
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Rule dot="dot-exact" pts="2" accent="text-exact" title="Resultado exacto">
            Aciertas el marcador idéntico. Ej.: dijiste 2-1 y fue 2-1, o dijiste 1-1 y fue 1-1.
          </Rule>
          <Rule dot="dot-winner" pts="1" accent="text-winner" title="Ganador correcto">
            Aciertas quién gana o el empate, sin el marcador exacto. Ej.: dijiste 2-1 y fue 3-1, o dijiste 1-1 y fue 2-2.
          </Rule>
          <Rule dot="dot-miss" pts="0" accent="text-miss" title="Pronóstico incorrecto">
            No aciertas ni el ganador ni el empate del partido.
          </Rule>
        </div>
      </section>

      {/* Progreso del torneo */}
      <TournamentProgress played={playedMatches} total={totalMatches} />

      <Leaderboard standings={standings} />

      <footer className="mt-16 flex items-center justify-center gap-4 text-xs text-white/30">
        <span>Quiniela Mundial 2026</span>
        <span>·</span>
        <Link href="/admin" className="transition hover:text-white/60">
          Administrar resultados
        </Link>
      </footer>
    </main>
  );
}

function TournamentProgress({ played, total }: { played: number; total: number }) {
  const pct = total > 0 ? Math.round((played / total) * 100) : 0;
  return (
    <section className="glass mb-12 rounded-2xl p-5">
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-white/55">
          Progreso del torneo
        </h2>
        <div className="text-right">
          <span className="text-2xl font-bold text-gradient">{played}</span>
          <span className="text-sm text-white/45"> / {total} partidos</span>
        </div>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/[0.06] ring-1 ring-white/5">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-neon via-neon2 to-exact shadow-[0_0_16px_rgba(34,211,238,0.55)] transition-[width] duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-white/40">
        <span>{pct}% completado</span>
        <span>Faltan {total - played} por jugar</span>
      </div>
    </section>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="glass inline-flex items-center rounded-full px-4 py-1.5 text-white/75">
      {children}
    </span>
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
    <div className="flex items-start gap-3 rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/5">
      <span className={`dot ${dot} mt-1 shrink-0`} />
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold">{title}</span>
          <span className={`text-sm font-bold ${accent}`}>
            {pts} {pts === "1" ? "pt" : "pts"}
          </span>
        </div>
        <p className="mt-0.5 text-xs leading-snug text-white/50">{children}</p>
      </div>
    </div>
  );
}
