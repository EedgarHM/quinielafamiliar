import Link from "next/link";
import AdminPanel from "@/components/AdminPanel";
import { getMatches } from "@/lib/standings";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const matches = getMatches();
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <header className="mb-8">
        <Link href="/" className="text-sm text-white/40 transition hover:text-white/70">
          ← Volver a la tabla
        </Link>
        <h1 className="mt-3 text-3xl font-black">
          <span className="text-gradient">Panel de resultados</span>
        </h1>
        <p className="mt-1 text-sm text-white/45">
          Captura el marcador de cada partido. La tabla se actualiza al instante para todos.
        </p>
      </header>
      <AdminPanel matches={matches} />
    </main>
  );
}
