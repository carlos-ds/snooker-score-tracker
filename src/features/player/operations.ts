import { db } from "@/lib/db";
import type { Player, CreatePlayerInput } from "@/types";

// Player related database operations

// Create a new player
// Returns the ID of the newly created player
export async function createPlayer(input: CreatePlayerInput): Promise<number> {
  const playerId = await db.players.add(input);
  if (!playerId) {
    throw new Error("Failed to create player");
  }
  return playerId;
}

// Get all players
export async function getAllPlayers(): Promise<Player[]> {
  return await db.players.toArray();
}

// Get a player by ID
export async function getPlayerById(id: number): Promise<Player | undefined> {
  return await db.players.get(id);
}

// Delete all players
export async function deleteAllPlayers(): Promise<void> {
  await db.players.clear();
}