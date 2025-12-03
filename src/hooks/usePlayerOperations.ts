import { db } from "../lib/db";

export const usePlayerOperations = () => {
  const addPlayer = async (name: string): Promise<number | undefined> => {
    return await db.players.add({ name });
  };

  return { addPlayer };
};
