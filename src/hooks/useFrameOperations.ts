import { db } from "@/lib/db";
import { type Frame } from "@/lib/Frame";

// Operations is for database queries

export const useFrameOperations = () => {
  // Creates a new frame for a game
  const createFrame = async (
    gameId: number,
    frameNumber: number,
    startingPlayerId: number
  ): Promise<number | undefined> => {
    const newFrame: Frame = {
      gameId,
      frameNumber,
      currentPlayerTurn: startingPlayerId,
      playerOneScore: 0,
      playerTwoScore: 0,
      playerOneBreak: 0,
      playerTwoBreak: 0,
      redsRemaining: 15,
      status: "active",
      createdAt: new Date(),
    };
    return await db.frames.add(newFrame);
  };

  // Gets the active frame for a specific game
  const getActiveFrame = async (gameId: number): Promise<Frame | undefined> => {
    return await db.frames
      .where("gameId")
      .equals(gameId)
      .and((frame) => frame.status === "active")
      .first();
  };

  // Gets all frames for a specific game
  const getFramesByGame = async (gameId: number): Promise<Frame[]> => {
    return await db.frames.where("gameId").equals(gameId).toArray();
  };

  // Updates frame scores after a shot
  const updateFrameScore = async (
    frameId: number,
    updates: Partial<Frame>
  ): Promise<void> => {
    await db.frames.update(frameId, updates);
  };

  // Completes a frame and sets the winner
  const completeFrame = async (
    frameId: number,
    winnerId: number
  ): Promise<void> => {
    await db.frames.update(frameId, {
      status: "completed",
      winnerId,
      completedAt: new Date(),
    });
  };

  return {
    createFrame,
    getActiveFrame,
    getFramesByGame,
    updateFrameScore,
    completeFrame,
  };
};
