import { db } from "../lib/db";

export const usePlayerOperations = () => {
  // Adds a new player to the database
  const addPlayer = async (name: string): Promise<number | undefined> => {
    return await db.players.add({ name });
  };

  // Gets all players from the database
  const getAllPlayers = async () => {
    return await db.players.toArray();
  };

  return { addPlayer, getAllPlayers };
};
