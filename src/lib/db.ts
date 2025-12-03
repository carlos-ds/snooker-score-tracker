import Dexie, { type EntityTable } from "dexie";

// Interface imports
import { type Player } from "./Player";

const db = new Dexie("SnookerScoreTrackerDB") as Dexie & {
  players: EntityTable<Player, "id">;
};

db.version(1).stores({
  players: "++id, name",
});

export { db };