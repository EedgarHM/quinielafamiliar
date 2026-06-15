import Link from "next/link";
import Dashboard from "@/components/Dashboard";
import { getSeed, loadStandings } from "@/lib/standings";

export const dynamic = "force-dynamic";

export default async function Home() {
  const seed = getSeed();
  const { results, standings } = await loadStandings();
  const totalMatches = seed.matches.length;
  const playedMatches = Object.keys(results).length;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:py-12">
      {/* Encabezado */}
      <header className="mb-10 text-center">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.4em] text-neon2/80">
          Quiniela
        </p>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          <span className="text-gradient">MUNDIAL 2026</span>
        </h1>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm">
          <span className="inline-flex items-center rounded-full bg-winner/15 px-4 py-1.5 font-semibold text-winner ring-1 ring-winner/30">
            🏆 Premio {seed.prize}
          </span>
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

      <Dashboard
        standings={standings}
        matches={seed.matches}
        results={results}
        played={playedMatches}
        total={totalMatches}
      />

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

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="glass inline-flex items-center rounded-full px-4 py-1.5 text-white/75">
      {children}
    </span>
  );
}
