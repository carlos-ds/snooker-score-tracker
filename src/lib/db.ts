import Dexie, { type EntityTable } from "dexie";

// Interface imports
import { type Player } from "./Player";
import { type Game } from "./Game";

const db = new Dexie("SnookerScoreTrackerDB") as Dexie & {
  players: EntityTable<Player, "id">;
  games: EntityTable<Game, "id">;
};

db.version(1).stores({
  players: "++id, name",
  games: "++id, status, createdAt",
});

export { db };
