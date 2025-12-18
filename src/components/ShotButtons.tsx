import { useState, useEffect } from "react";
import { type Frame } from "@/lib/Frame";
import {
  useEndBreakMutation,
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
  const endBreakMutation = useEndBreakMutation();
  const undoMutation = useUndoLastShotMutation();
  const { getShotsByFrame } = useShotOperations();

  const [hasShotsToUndo, setHasShotsToUndo] = useState(false);
  const [lastShotWasRed, setLastShotWasRed] = useState(false);
  const [isLastRedColorChoice, setIsLastRedColorChoice] = useState(false);
  const [strictOrderIndex, setStrictOrderIndex] = useState(0);

  // Check if there are shots to undo and what the last shot was
  useEffect(() => {
    const checkShots = async () => {
      if (frame.id) {
        const shots = await getShotsByFrame(frame.id);
        setHasShotsToUndo(shots.length > 0);

        // Get the very last shot (including "foul" type)
        const lastShot = shots[shots.length - 1];

        // If the last shot was made by a DIFFERENT player than current,
        // OR if there are no shots, then reset to "no red potted" state
        if (!lastShot || lastShot.playerId !== frame.currentPlayerTurn) {
          setLastShotWasRed(false);
        } else {
          // Last shot was by current player - check if it was a red
          const lastNonFoulShotByCurrentPlayer = [...shots]
            .reverse()
            .find(
              (s) =>
                s.ballType !== "foul" && s.playerId === frame.currentPlayerTurn
            );

          setLastShotWasRed(lastNonFoulShotByCurrentPlayer?.ballType === "red");
        }

        // Check if we're in "last red color choice" phase
        const isLastRedJustPotted =
          frame.redsRemaining === 0 && lastShot?.ballType === "red";

        setIsLastRedColorChoice(isLastRedJustPotted);

        // Calculate strict order index if in colors-only phase
        if (frame.redsRemaining === 0 && !isLastRedJustPotted) {
          let colorsPottedAfterReds = 0;
          let redsCount = 15;

          for (const shot of shots) {
            if (shot.ballType === "red") {
              redsCount--;
            } else if (shot.ballType !== "foul" && redsCount === 0) {
              colorsPottedAfterReds++;
            }
          }

          setStrictOrderIndex(Math.max(0, colorsPottedAfterReds - 1));
        }
      }
    };
    checkShots();
  }, [frame, getShotsByFrame]);


  // Determine which balls can be potted based on game phase
  const isRedsPhase = frame.redsRemaining > 0;
  const isStrictOrderPhase = !isRedsPhase && !isLastRedColorChoice;

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

  const handleEndBreak = async () => {
    try {
      await endBreakMutation.mutateAsync({
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

  // Define color order for strict clearance
  const colorOrder = ["yellow", "green", "brown", "blue", "pink", "black"];

  // Helper function to check if a color is allowed in strict order phase
  const isColorAllowedInStrictOrder = (colorName: string) => {
    if (!isStrictOrderPhase) return true;
    return colorOrder[strictOrderIndex] === colorName;
  };

  // Determine if red button should be enabled
  // Red is enabled when: in reds phase (regardless of last shot) and not currently processing
  const redEnabled = isRedsPhase && !recordShotMutation.isPending;

  // Determine if color buttons should be enabled
  // In reds phase: colors enabled only after potting a red
  // In last red color choice: all colors enabled
  // In strict order: only the next color in sequence enabled
  const yellowEnabled = isRedsPhase
    ? lastShotWasRed && !recordShotMutation.isPending
    : isLastRedColorChoice
      ? !recordShotMutation.isPending
      : isColorAllowedInStrictOrder("yellow") && !recordShotMutation.isPending;

  const greenEnabled = isRedsPhase
    ? lastShotWasRed && !recordShotMutation.isPending
    : isLastRedColorChoice
      ? !recordShotMutation.isPending
      : isColorAllowedInStrictOrder("green") && !recordShotMutation.isPending;

  const brownEnabled = isRedsPhase
    ? lastShotWasRed && !recordShotMutation.isPending
    : isLastRedColorChoice
      ? !recordShotMutation.isPending
      : isColorAllowedInStrictOrder("brown") && !recordShotMutation.isPending;

  const blueEnabled = isRedsPhase
    ? lastShotWasRed && !recordShotMutation.isPending
    : isLastRedColorChoice
      ? !recordShotMutation.isPending
      : isColorAllowedInStrictOrder("blue") && !recordShotMutation.isPending;

  const pinkEnabled = isRedsPhase
    ? lastShotWasRed && !recordShotMutation.isPending
    : isLastRedColorChoice
      ? !recordShotMutation.isPending
      : isColorAllowedInStrictOrder("pink") && !recordShotMutation.isPending;

  const blackEnabled = isRedsPhase
    ? lastShotWasRed && !recordShotMutation.isPending
    : isLastRedColorChoice
      ? !recordShotMutation.isPending
      : isColorAllowedInStrictOrder("black") && !recordShotMutation.isPending;

  return (
    <div>
      <h3>Shot</h3>

      {/* Red button */}
      <div>
        <button onClick={() => handlePot("red", 1)} disabled={!redEnabled}>
          Red (1)
        </button>
      </div>

      {/* Color buttons */}
      <div>
        <button onClick={() => handlePot("yellow", 2)} disabled={!yellowEnabled}>
          Yellow (2)
        </button>
        <button onClick={() => handlePot("green", 3)} disabled={!greenEnabled}>
          Green (3)
        </button>
        <button onClick={() => handlePot("brown", 4)} disabled={!brownEnabled}>
          Brown (4)
        </button>
        <button onClick={() => handlePot("blue", 5)} disabled={!blueEnabled}>
          Blue (5)
        </button>
        <button onClick={() => handlePot("pink", 6)} disabled={!pinkEnabled}>
          Pink (6)
        </button>
        <button onClick={() => handlePot("black", 7)} disabled={!blackEnabled}>
          Black (7)
        </button>
      </div>

      <div>
        <button onClick={handleEndBreak} disabled={endBreakMutation.isPending}>
          {endBreakMutation.isPending ? "Switching..." : "End Break"}
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
