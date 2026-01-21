import { db } from "@/lib/db";
import type { Game, CreateGameInput } from "@/types";
import { GAME_STATUS } from "@/config/constants";

// Game related database operations

// Create a new game
// Returns the ID of the newly created game
export async function createGame(input: CreateGameInput): Promise<number> {
  const newGame: Omit<Game, "id"> = {
    ...input,
    createdAt: new Date(),
    status: GAME_STATUS.ACTIVE,
  };

  const gameId = await db.games.add(newGame);
  if (!gameId) {
    throw new Error("Failed to create game");
  }
  return gameId;
}

// Get active game
export async function getActiveGame(): Promise<Game | undefined> {
  return await db.games.where("status").equals(GAME_STATUS.ACTIVE).first();
}

// Mark active game as completed
export async function completeActiveGame(): Promise<void> {
  const activeGame = await getActiveGame();
  if (activeGame?.id) {
    await db.games.update(activeGame.id, { status: GAME_STATUS.COMPLETED });
  }
}

// Get a game by ID
export async function getGameById(id: number): Promise<Game | undefined> {
  return await db.games.get(id);
}

// Get the most recently completed game
export async function getLatestCompletedGame(): Promise<Game | undefined> {
  const completedGames = await db.games
    .where("status")
    .equals(GAME_STATUS.COMPLETED)
    .toArray();

  if (completedGames.length === 0) {
    return undefined;
  }

  // Sort by createdAt descending (newest first)
  return completedGames.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
}

// Get the latest game (active preferred, otherwise most recent completed)
export async function getLatestGame(): Promise<Game | undefined> {
  const activeGame = await getActiveGame();
  if (activeGame) {
    return activeGame;
  }
  return await getLatestCompletedGame();
}

// Delete all games
export async function deleteAllGames(): Promise<void> {
  await db.games.clear();
}