import Dexie, { type EntityTable } from "dexie";

// Interface imports
import { type Player } from "./Player";
import { type Game } from "./Game";
import { type Frame } from "./Frame";
import { type Shot } from "./Shot";

const db = new Dexie("SnookerScoreTrackerDB") as Dexie & {
  players: EntityTable<Player, "id">;
  games: EntityTable<Game, "id">;
  frames: EntityTable<Frame, "id">;
  shots: EntityTable<Shot, "id">;
};

db.version(2).stores({
  players: "++id, name",
  games: "++id, status, createdAt",
  frames: "++id, gameId, status, frameNumber",
  shots: "++id, frameId, playerId, timestamp",
});

export { db };
