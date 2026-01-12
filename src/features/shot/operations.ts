import { db } from "@/lib/db";
import type { Shot, RecordShotInput } from "@/types";

// Shot related database operations

// Record a new shot
// Returns the ID of the newly recorded shot
export async function recordShot(input: RecordShotInput): Promise<number> {
  const newShot: Omit<Shot, "id"> = {
    ...input,
    isFoul: input.isFoul ?? false,
    timestamp: new Date(),
  };

  const shotId = await db.shots.add(newShot);
  if (!shotId) {
    throw new Error("Failed to record shot");
  }
  return shotId;
}

// Get all shots for a specific frame, ordered by timestamp
export async function getShotsByFrame(frameId: number): Promise<Shot[]> {
  return await db.shots.where("frameId").equals(frameId).sortBy("timestamp");
}

// Delete last shot in a frame
// Used for undo functionality
export async function deleteLastShot(frameId: number): Promise<void> {
  const shots = await getShotsByFrame(frameId);
  const lastShot = shots[shots.length - 1];

  if (!lastShot?.id) {
    throw new Error("No shots to delete");
  }

  await db.shots.delete(lastShot.id);
}

// Delete all shots
export async function deleteAllShots(): Promise<void> {
  await db.shots.clear();
}