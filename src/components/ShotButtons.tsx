import { useState, useEffect } from "react";
import { type Frame } from "@/lib/Frame";
import {
  useEndTurnMutation,
  useRecordShotMutation,
  useUndoLastShotMutation,
} from "@/hooks/useShotRecording";
import { useShotOperations } from "@/hooks/useShotOperations";

interface ShotButtonsProps {
  frame: Frame;
  gameId: number;
  playerOneId: number;
  playerTwoId: number;
}

function ShotButtons({
  frame,
  gameId,
  playerOneId,
  playerTwoId,
}: ShotButtonsProps) {
  const recordShotMutation = useRecordShotMutation();
  const endTurnMutation = useEndTurnMutation();
  const undoMutation = useUndoLastShotMutation();
  const { getShotsByFrame } = useShotOperations();

  const [hasShotsToUndo, setHasShotsToUndo] = useState(false);

  // Check if there are shots to undo
  useEffect(() => {
    const checkShots = async () => {
      if (frame.id) {
        const shots = await getShotsByFrame(frame.id);
        setHasShotsToUndo(shots.length > 0);
      }
    };
    checkShots();
  }, [frame, getShotsByFrame]);

  // Determine which balls can be potted based on game phase
  const isRedsPhase = frame.redsRemaining > 0;

  const handlePot = async (
    ballType: "red" | "yellow" | "green" | "brown" | "blue" | "pink" | "black",
    points: number
  ) => {
    try {
      await recordShotMutation.mutateAsync({
        frame,
        ballType,
        points,
        gameId,
        playerOneId,
      });
    } catch (error) {
      console.error("Failed to record shot:", error);
    }
  };

  const handleFoul = async () => {
    try {
      await endTurnMutation.mutateAsync({
        frame,
        gameId,
        playerOneId,
        playerTwoId,
      });
    } catch (error) {
      console.error("Failed to end turn:", error);
    }
  };

  const handleUndo = async () => {
    try {
      await undoMutation.mutateAsync({
        frame,
        gameId,
        playerOneId,
        playerTwoId,
      });
    } catch (error) {
      console.error("Failed to undo:", error);
    }
  };


  return (
    <div>
      <h3>Shot</h3>

      {/* Phase 1: Reds still on table */}
      {isRedsPhase && (
        <>
          <div>
            <button
              onClick={() => handlePot("red", 1)}
              disabled={recordShotMutation.isPending}
            >
              Red (1)
            </button>
          </div>

          <div>
            <button onClick={() => handlePot("yellow", 2)}>Yellow (2)</button>
            <button onClick={() => handlePot("green", 3)}>Green (3)</button>
            <button onClick={() => handlePot("brown", 4)}>Brown (4)</button>
            <button onClick={() => handlePot("blue", 5)}>Blue (5)</button>
            <button onClick={() => handlePot("pink", 6)}>Pink (6)</button>
            <button onClick={() => handlePot("black", 7)}>Black (7)</button>
          </div>
        </>
      )}

      {/* Phase 2: All reds gone, pot colors in order */}
      {!isRedsPhase && (
        <div>
          <button onClick={() => handlePot("yellow", 2)}>Yellow (2)</button>
          <button onClick={() => handlePot("green", 3)}>Green (3)</button>
          <button onClick={() => handlePot("brown", 4)}>Brown (4)</button>
          <button onClick={() => handlePot("blue", 5)}>Blue (5)</button>
          <button onClick={() => handlePot("pink", 6)}>Pink (6)</button>
          <button onClick={() => handlePot("black", 7)}>Black (7)</button>
        </div>
      )}

      <div>
        <button onClick={handleFoul} disabled={endTurnMutation.isPending}>
          {endTurnMutation.isPending ? "Switching..." : "Foul"}
        </button>

        <button
          onClick={handleUndo}
          disabled={undoMutation.isPending || !hasShotsToUndo}
        >
          {undoMutation.isPending ? "Undoing..." : "Undo"}
        </button>
      </div>
    </div>
  );
}

export default ShotButtons;
