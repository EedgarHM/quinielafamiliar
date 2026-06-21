"use client";

import { useEffect, useMemo, useState } from "react";
import Flag from "./Flag";
import { formatDateLong, todayISO } from "@/lib/format";
import type { Match, ResultsMap } from "@/lib/types";

export default function AdminPanel({ matches }: { matches: Match[] }) {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [results, setResults] = useState<ResultsMap>({});
  const [error, setError] = useState("");
  // null = vista por defecto (hoy + próximos). Si trae fecha, muestra ese día.
  const [filterDate, setFilterDate] = useState<string | null>(null);

  // Cargar resultados existentes
  useEffect(() => {
    fetch("/api/results")
      .then((r) => r.json())
      .then((d: { results: ResultsMap }) => setResults(d.results ?? {}))
      .catch(() => {});
  }, []);

  const today = todayISO();

  const allDates = useMemo(
    () => [...new Set(matches.map((m) => m.date))].sort(),
    [matches]
  );

  // Partidos de días YA PASADOS (para el sidebar), más recientes primero.
  const playedDays = useMemo(
    () =>
      matches
        .filter((m) => m.date < today)
        .sort((a, b) => b.date.localeCompare(a.date) || b.n - a.n),
    [matches, today]
  );
  const todays = useMemo(
    () => matches.filter((m) => m.date === today).sort((a, b) => a.n - b.n),
    [matches, today]
  );
  const future = useMemo(
    () => matches.filter((m) => m.date > today).sort((a, b) => a.n - b.n),
    [matches, today]
  );
  // Partidos ya jugados que aún NO tienen marcador capturado.
  const pendingPlayed = useMemo(
    () => playedDays.filter((m) => results[m.n] === undefined).length,
    [playedDays, results]
  );

  const visible = useMemo(
    () =>
      filterDate
        ? matches.filter((m) => m.date === filterDate).sort((a, b) => a.n - b.n)
        : null,
    [matches, filterDate]
  );

  const onSaved = (n: number) => (home: number, away: number) =>
    setResults((prev) => ({ ...prev, [n]: { home, away } }));
  const onCleared = (n: number) => () =>
    setResults((prev) => {
      const next = { ...prev };
      delete next[n];
      return next;
    });

  const renderRow = (m: Match) => (
    <MatchRow
      key={m.n}
      match={m}
      password={password}
      value={results[m.n]}
      onSaved={onSaved(m.n)}
      onCleared={onCleared(m.n)}
      onError={setError}
    />
  );

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
    <div className="lg:grid lg:grid-cols-[1fr_19rem] lg:items-start lg:gap-6">
      {/* Panel principal de captura */}
      <div className="min-w-0">
        {error && (
          <div className="mb-4 rounded-xl border border-miss/40 bg-miss/10 px-4 py-2 text-sm text-miss">
            {error}
          </div>
        )}

        {/* Filtro por fecha */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <label className="text-xs uppercase tracking-wider text-white/40">
            Filtrar por fecha
          </label>
          <select
            value={filterDate ?? ""}
            onChange={(e) => setFilterDate(e.target.value || null)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none transition focus:border-neon"
          >
            <option value="">Hoy y próximos</option>
            {allDates.map((d) => {
              const count = matches.filter((m) => m.date === d).length;
              return (
                <option key={d} value={d}>
                  {formatDateLong(d)} ({count})
                </option>
              );
            })}
          </select>
          {filterDate && (
            <button
              onClick={() => setFilterDate(null)}
              className="rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-white/50 transition hover:bg-white/10 hover:text-white"
            >
              ✕ Quitar filtro
            </button>
          )}
        </div>

        {visible ? (
          /* Vista de una fecha seleccionada */
          <Group title={formatDateLong(filterDate!)} count={visible.length}>
            {visible.length > 0 ? (
              visible.map(renderRow)
            ) : (
              <EmptyHint>No hay partidos ese día.</EmptyHint>
            )}
          </Group>
        ) : (
          /* Vista por defecto: HOY (separado) y PRÓXIMOS */
          <>
            <Group title="Hoy" count={todays.length} accent>
              {todays.length > 0 ? (
                todays.map(renderRow)
              ) : (
                <EmptyHint>No hay partidos hoy.</EmptyHint>
              )}
            </Group>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/30">
                Próximos
              </span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <Group title="Próximos" count={future.length} hideTitle>
              {future.length > 0 ? (
                future.map(renderRow)
              ) : (
                <EmptyHint>No quedan partidos por jugar.</EmptyHint>
              )}
            </Group>
          </>
        )}
      </div>

      {/* Sidebar: partidos ya jugados (días previos) */}
      <aside className="mt-8 lg:mt-0 lg:sticky lg:top-6">
        <div className="glass rounded-2xl p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">
              Ya jugados · {playedDays.length}
            </h2>
            {pendingPlayed > 0 && (
              <span className="rounded-full bg-miss/15 px-2 py-0.5 text-[10px] font-semibold text-miss">
                {pendingPlayed} sin capturar
              </span>
            )}
          </div>

          {playedDays.length === 0 ? (
            <p className="py-4 text-center text-xs text-white/35">
              Aún no hay partidos de días previos.
            </p>
          ) : (
            <div className="max-h-[70vh] space-y-1.5 overflow-y-auto pr-1 [scrollbar-width:thin]">
              {playedDays.map((m) => {
                const real = results[m.n];
                const captured = real !== undefined;
                const active = filterDate === m.date;
                return (
                  <button
                    key={m.n}
                    onClick={() => setFilterDate(m.date)}
                    title={`Editar P${m.n} (${formatDateLong(m.date)})`}
                    className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition hover:bg-white/[0.06] ${
                      active ? "bg-neon/[0.1] ring-1 ring-neon/40" : "bg-white/[0.03]"
                    } ${!captured ? "ring-1 ring-miss/25" : ""}`}
                  >
                    <span className="w-7 shrink-0 text-center text-[10px] text-white/35">
                      P{m.n}
                    </span>
                    <Flag iso={m.homeIso} name={m.home} size="sm" />
                    <span className="min-w-0 flex-1 truncate text-xs text-white/75">
                      {m.home} <span className="text-white/30">vs</span> {m.away}
                    </span>
                    <Flag iso={m.awayIso} name={m.away} size="sm" />
                    {captured ? (
                      <span className="shrink-0 font-mono text-xs font-bold text-exact">
                        {real.home}-{real.away}
                      </span>
                    ) : (
                      <span className="shrink-0 text-[10px] font-medium text-miss">falta</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          <p className="mt-3 text-[11px] leading-snug text-white/35">
            Toca un partido para abrir su día y editar el marcador.
          </p>
        </div>
      </aside>
    </div>
  );
}

function Group({
  title,
  count,
  children,
  accent = false,
  hideTitle = false,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  accent?: boolean;
  hideTitle?: boolean;
}) {
  return (
    <div>
      {!hideTitle && (
        <div className="mb-2 flex items-center gap-2">
          <h2
            className={`text-sm font-bold ${accent ? "text-gradient" : "text-white/85"}`}
          >
            {title}
          </h2>
          <span className="text-[11px] text-white/35">· {count}</span>
        </div>
      )}
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white/[0.03] px-4 py-6 text-center text-sm text-white/40">
      {children}
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
