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

  // Marks the active game as completed
  const completeActiveGame = async (): Promise<void> => {
    const activeGame = await getActiveGame();
    if (activeGame && activeGame.id) {
      await db.games.update(activeGame.id, { status: "completed" });
    }
  };

  // Deletes all games from the database
  const deleteAllGames = async (): Promise<void> => {
    await db.games.clear();
  };

  return {
    createGame,
    getActiveGame,
    completeActiveGame,
    deleteAllGames,
  };
};
