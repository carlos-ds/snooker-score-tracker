import { db } from "../lib/db";
import { type Game } from "../lib/Game";

export const useGameOperations = () => {
  // Creates a new game with two players
  const createGame = async (
    playerOneId: number,
    playerTwoId: number
  ): Promise<number | undefined> => {
    const newGame: Game = {
      playerOneId,
      playerTwoId,
      createdAt: new Date(),
      status: "active",
    };
    return await db.games.add(newGame);
  };

  // Gets the currently active game (if any)
  const getActiveGame = async (): Promise<Game | undefined> => {
    return await db.games.where("status").equals("active").first();
  };

  // Gets all games (for future use)
  const getAllGames = async (): Promise<Game[]> => {
    return await db.games.toArray();
  };

  return { createGame, getActiveGame, getAllGames };
};
