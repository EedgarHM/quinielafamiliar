import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { ResultsMap } from "./types";

/**
 * Almacén de resultados con dos backends:
 *  - MongoDB (producción / Railway): usa MONGODB_URI. Colección `results`,
 *    un documento por partido { _id: matchN, home, away, updatedAt }.
 *  - Local sin DB: archivo JSON en .data/results.json (solo para desarrollo
 *    rápido sin conexión; NO persiste en Railway).
 * Los pronósticos y partidos son estáticos (seed.json); aquí solo viven los
 * resultados reales que el admin captura conforme se juegan los partidos.
 */

const useMongo = !!process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || "quiniela";
// Fase 16vos: colección propia para que el ranking arranque desde cero.
// Los resultados de la fase de grupos quedan intactos en la colección "results".
const COLLECTION = "results_16vos";

type ResultDoc = { _id: number; home: number; away: number; updatedAt: Date };

// ---------- Backend MongoDB ----------
// Cliente cacheado en global para sobrevivir al hot-reload de Next en dev.
type MongoModule = typeof import("mongodb");
const globalForMongo = globalThis as unknown as {
  _mongoClient?: Promise<import("mongodb").MongoClient>;
};

async function getCollection() {
  if (!globalForMongo._mongoClient) {
    globalForMongo._mongoClient = (async () => {
      const { MongoClient }: MongoModule = await import("mongodb");
      const client = new MongoClient(process.env.MONGODB_URI as string);
      await client.connect();
      return client;
    })();
  }
  const client = await globalForMongo._mongoClient;
  return client.db(DB_NAME).collection<ResultDoc>(COLLECTION);
}

async function mongoGetAll(): Promise<ResultsMap> {
  const col = await getCollection();
  const docs = await col.find({}).toArray();
  const map: ResultsMap = {};
  for (const d of docs) map[d._id] = { home: d.home, away: d.away };
  return map;
}

async function mongoSet(matchN: number, home: number, away: number) {
  const col = await getCollection();
  await col.updateOne(
    { _id: matchN },
    { $set: { home, away, updatedAt: new Date() } },
    { upsert: true }
  );
}

async function mongoClear(matchN: number) {
  const col = await getCollection();
  await col.deleteOne({ _id: matchN });
}

// ---------- Backend JSON local ----------
const FILE = path.join(process.cwd(), ".data", "results.json");

async function jsonGetAll(): Promise<ResultsMap> {
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    return JSON.parse(raw) as ResultsMap;
  } catch {
    return {};
  }
}

async function jsonWriteAll(map: ResultsMap) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(map, null, 2), "utf-8");
}

async function jsonSet(matchN: number, home: number, away: number) {
  const map = await jsonGetAll();
  map[matchN] = { home, away };
  await jsonWriteAll(map);
}

async function jsonClear(matchN: number) {
  const map = await jsonGetAll();
  delete map[matchN];
  await jsonWriteAll(map);
}

// ---------- API pública ----------
export async function getResults(): Promise<ResultsMap> {
  return useMongo ? mongoGetAll() : jsonGetAll();
}

export async function setResult(matchN: number, home: number, away: number) {
  return useMongo ? mongoSet(matchN, home, away) : jsonSet(matchN, home, away);
}

export async function clearResult(matchN: number) {
  return useMongo ? mongoClear(matchN) : jsonClear(matchN);
}

export const backend = useMongo ? "mongodb" : "json";
