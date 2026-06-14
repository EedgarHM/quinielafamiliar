"use client";

import { useEffect, useState } from "react";
import Flag from "./Flag";
import type { Match, ResultsMap } from "@/lib/types";

export default function AdminPanel({ matches }: { matches: Match[] }) {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [results, setResults] = useState<ResultsMap>({});
  const [error, setError] = useState("");

  // Cargar resultados existentes
  useEffect(() => {
    fetch("/api/results")
      .then((r) => r.json())
      .then((d: { results: ResultsMap }) => setResults(d.results ?? {}))
      .catch(() => {});
  }, []);

  if (!authed) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (password.trim()) setAuthed(true);
        }}
        className="glass mx-auto max-w-sm rounded-2xl p-6"
      >
        <label className="mb-2 block text-sm text-white/60">Contraseña de administrador</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 outline-none transition focus:border-neon"
          placeholder="••••••••"
        />
        <button
          type="submit"
          className="mt-4 w-full rounded-xl bg-gradient-to-r from-neon to-neon2 py-2.5 font-semibold text-white transition hover:opacity-90"
        >
          Entrar
        </button>
        <p className="mt-3 text-center text-xs text-white/35">
          La contraseña se valida en el servidor al guardar.
        </p>
      </form>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-xl border border-miss/40 bg-miss/10 px-4 py-2 text-sm text-miss">
          {error}
        </div>
      )}
      <div className="space-y-2">
        {matches.map((m) => (
          <MatchRow
            key={m.n}
            match={m}
            password={password}
            value={results[m.n]}
            onSaved={(home, away) =>
              setResults((prev) => ({ ...prev, [m.n]: { home, away } }))
            }
            onCleared={() =>
              setResults((prev) => {
                const next = { ...prev };
                delete next[m.n];
                return next;
              })
            }
            onError={setError}
          />
        ))}
      </div>
    </div>
  );
}

function MatchRow({
  match,
  password,
  value,
  onSaved,
  onCleared,
  onError,
}: {
  match: Match;
  password: string;
  value?: { home: number; away: number };
  onSaved: (home: number, away: number) => void;
  onCleared: () => void;
  onError: (msg: string) => void;
}) {
  const [home, setHome] = useState<string>(value ? String(value.home) : "");
  const [away, setAway] = useState<string>(value ? String(value.away) : "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sincroniza si cambian los valores externos (carga inicial)
  useEffect(() => {
    setHome(value ? String(value.home) : "");
    setAway(value ? String(value.away) : "");
  }, [value]);

  const hasResult = value !== undefined;

  async function save() {
    onError("");
    const h = parseInt(home, 10);
    const a = parseInt(away, 10);
    if (Number.isNaN(h) || Number.isNaN(a)) {
      onError(`Partido ${match.n}: captura ambos marcadores.`);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({ matchN: match.n, home: h, away: a }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        onError(d.error ?? "Error al guardar (¿contraseña correcta?).");
        return;
      }
      onSaved(h, a);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch {
      onError("Error de red al guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function clear() {
    onError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/results?matchN=${match.n}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${password}` },
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        onError(d.error ?? "Error al borrar.");
        return;
      }
      setHome("");
      setAway("");
      onCleared();
    } catch {
      onError("Error de red al borrar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={`glass flex items-center gap-2 rounded-xl px-3 py-2.5 ${
        hasResult ? "ring-1 ring-exact/30" : ""
      }`}
    >
      <span className="w-7 shrink-0 text-center text-xs text-white/35">{match.n}</span>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <span className="truncate text-right text-sm">{match.home}</span>
        <Flag iso={match.homeIso} name={match.home} size="sm" />
      </div>
      <input
        inputMode="numeric"
        value={home}
        onChange={(e) => setHome(e.target.value.replace(/\D/g, "").slice(0, 2))}
        className="w-10 rounded-lg border border-white/10 bg-white/5 py-1.5 text-center font-mono outline-none focus:border-neon"
      />
      <span className="text-white/30">-</span>
      <input
        inputMode="numeric"
        value={away}
        onChange={(e) => setAway(e.target.value.replace(/\D/g, "").slice(0, 2))}
        className="w-10 rounded-lg border border-white/10 bg-white/5 py-1.5 text-center font-mono outline-none focus:border-neon"
      />
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Flag iso={match.awayIso} name={match.away} size="sm" />
        <span className="truncate text-sm">{match.away}</span>
      </div>
      <button
        onClick={save}
        disabled={saving}
        className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
          saved
            ? "bg-exact/20 text-exact"
            : "bg-gradient-to-r from-neon to-neon2 text-white hover:opacity-90"
        } disabled:opacity-50`}
      >
        {saved ? "✓" : saving ? "…" : "Guardar"}
      </button>
      {hasResult && (
        <button
          onClick={clear}
          disabled={saving}
          title="Borrar resultado"
          className="shrink-0 rounded-lg bg-white/5 px-2 py-1.5 text-xs text-white/40 transition hover:bg-miss/15 hover:text-miss disabled:opacity-50"
        >
          ✕
        </button>
      )}
    </div>
  );
}
