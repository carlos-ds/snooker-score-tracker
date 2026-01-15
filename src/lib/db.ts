import Dexie, { type EntityTable } from "dexie";
import type { Player, Game, Frame, Shot } from "@/types";

const db = new Dexie("SnookerScoreTrackerDB") as Dexie & {
  players: EntityTable<Player, "id">;
  games: EntityTable<Game, "id">;
  frames: EntityTable<Frame, "id">;
  shots: EntityTable<Shot, "id">;
};

db.version(1).stores({
  players: "++id, name",
  games: "++id, status, createdAt, redsCount, bestOfFrames",
  frames: "++id, gameId, status, frameNumber",
  shots: "++id, frameId, playerId, timestamp",
});

export { db };
