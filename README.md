# 🏆 Quiniela Mundial 2026

App web para seguir **en vivo** la quiniela del Mundial 2026: tabla de posiciones,
podio Top 5, pronósticos de cada participante con semáforo de aciertos y banderas
de cada selección. Diseño oscuro, elegante y futurista.

## Cómo funciona

- **Datos estáticos (semilla):** los 72 partidos y los pronósticos de los 31
  participantes se extrajeron del Excel original y viven en `src/data/seed.json`.
  No cambian durante el torneo.
- **Resultados (dinámicos):** se capturan desde `/admin` conforme se juegan los
  partidos y se guardan en **MongoDB** (o en un JSON local en desarrollo).
- **Puntuación:**
  - `2` puntos → marcador **exacto** (verde)
  - `1` punto → acertó al **ganador** o el empate (ámbar)
  - `0` puntos → **falló** (rojo)

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # define ADMIN_PASSWORD y MONGODB_URI
npm run dev                  # http://localhost:3000
```

Define `MONGODB_URI` en `.env.local` para que los resultados persistan. Sin ella se usa
`.data/results.json` (solo dev, no persiste). El panel de administración está en `/admin`.

## Desplegar en Railway (Docker + MongoDB)

1. **Sube el repo a GitHub** y en Railway elige *New Project → Deploy from GitHub repo*.
2. Railway detecta el **`Dockerfile`** y construye la imagen (salida *standalone* de Next).
3. **Define las variables** del servicio (Settings → Variables):
   - `ADMIN_PASSWORD` → tu contraseña para capturar resultados.
   - `MONGODB_URI` → la URI de tu cluster de MongoDB Atlas.
   - *(opcional)* `MONGODB_DB` → nombre de la base (por defecto `quiniela`).
4. En **MongoDB Atlas → Network Access**, permite la IP de Railway (o `0.0.0.0/0`
   temporalmente) para que el contenedor pueda conectarse.
5. Railway expone el servicio en su dominio; el contenedor escucha en `PORT` (3000).

> La colección `results` se crea sola al guardar el primer marcador.

## Estructura

```
src/
  app/
    page.tsx                 # tabla pública (Server Component)
    admin/page.tsx           # panel de captura de resultados
    api/results/route.ts     # GET/POST/DELETE resultados (POST/DELETE protegidos)
    api/player/[id]/route.ts # detalle de un jugador para el modal
  components/
    Leaderboard.tsx          # podio + tabla + apertura de modal
    PlayerModal.tsx          # últimos pronósticos + resumen
    AdminPanel.tsx           # captura de marcadores
    Flag.tsx                 # bandera (flagcdn)
  lib/
    scoring.ts               # regla 0/1/2
    standings.ts             # cálculo de posiciones y detalle
    results-store.ts         # MongoDB en prod / JSON en local
    types.ts
  data/seed.json             # partidos + pronósticos (del Excel)
```
