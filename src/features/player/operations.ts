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
  const players = await db.players.toArray();
  // Ensure all players have highestBreak property (default to 0 for legacy players)
  return players.map(player => ({
    ...player,
    highestBreak: player.highestBreak ?? 0,
  }));
}

// Get a player by ID
export async function getPlayerById(id: number): Promise<Player | undefined> {
  const player = await db.players.get(id);
  if (!player) return undefined;
  // Ensure player has highestBreak property (default to 0 for legacy players)
  return {
    ...player,
    highestBreak: player.highestBreak ?? 0,
  };
}

// Update highest break for a player
// Returns the player ID
export async function updatePlayerHighestBreak(
  playerId: number,
  breakScore: number
): Promise<void> {
  const player = await db.players.get(playerId);
  if (!player) {
    throw new Error("Player not found");
  }

  const newHighestBreak = Math.max(player.highestBreak, breakScore);
  await db.players.update(playerId, { highestBreak: newHighestBreak });
}

// Delete all players
export async function deleteAllPlayers(): Promise<void> {
  await db.players.clear();
}