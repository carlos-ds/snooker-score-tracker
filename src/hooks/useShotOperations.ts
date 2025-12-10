import { db } from "@/lib/db";
import { type Shot } from "@/lib/Shot";

// Operations is for database queries

export const useShotOperations = () => {
  // Records a shot in the database
  const recordShot = async (
    shot: Omit<Shot, "id">
  ): Promise<number | undefined> => {
    return await db.shots.add(shot);
  };

  // Gets all shots for a specific frame (for history/undo)
  const getShotsByFrame = async (frameId: number): Promise<Shot[]> => {
    return await db.shots.where("frameId").equals(frameId).sortBy("timestamp");
  };

  // Deletes the last shot (for undo functionality)
  const deleteLastShot = async (frameId: number): Promise<void> => {
    const shots = await getShotsByFrame(frameId);
    const lastShot = shots[shots.length - 1];
    if (lastShot?.id) {
      await db.shots.delete(lastShot.id);
    }
  };

  return {
    recordShot,
    getShotsByFrame,
    deleteLastShot,
  };
};
