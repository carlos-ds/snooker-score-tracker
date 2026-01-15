import { db } from "@/lib/db";
import type { Frame, CreateFrameInput, FrameScoreUpdate } from "@/types";
import { FRAME_STATUS, SNOOKER_RULES } from "@/config/constants";

// Frame related database operations

// Create a new frame
// Returns the ID of the newly created frame
export async function createFrame(input: CreateFrameInput): Promise<number> {
  const newFrame: Omit<Frame, "id"> = {
    gameId: input.gameId,
    frameNumber: input.frameNumber,
    currentPlayerTurn: input.startingPlayerId,
    playerOneScore: SNOOKER_RULES.INITIAL_SCORE,
    playerTwoScore: SNOOKER_RULES.INITIAL_SCORE,
    playerOneBreak: SNOOKER_RULES.INITIAL_BREAK,
    playerTwoBreak: SNOOKER_RULES.INITIAL_BREAK,
    redsRemaining: input.redsCount,
    status: FRAME_STATUS.ACTIVE,
    createdAt: new Date(),
  };

  const frameId = await db.frames.add(newFrame);
  if (!frameId) {
    throw new Error("Failed to create frame");
  }
  return frameId;
}

// Get active frame for a specific game
export async function getActiveFrame(
  gameId: number
): Promise<Frame | undefined> {
  return await db.frames
    .where("gameId")
    .equals(gameId)
    .and((frame) => frame.status === FRAME_STATUS.ACTIVE)
    .first();
}

// Get all frames for a specific game
export async function getFramesByGame(gameId: number): Promise<Frame[]> {
  return await db.frames.where("gameId").equals(gameId).toArray();
}

// Update frame score and state after a shot
export async function updateFrameScore(
  frameId: number,
  updates: FrameScoreUpdate
): Promise<void> {
  await db.frames.update(frameId, updates);
}

// Mark a frame as completed with winner
export async function completeFrame(
  frameId: number, winnerId: number
): Promise<void> {
  await db.frames.update(frameId, {
    status: FRAME_STATUS.COMPLETED,
    winnerId,
    completedAt: new Date(),
  });
}

// Delete all frames
export async function deleteAllFrames(): Promise<void> {
  await db.frames.clear();
}