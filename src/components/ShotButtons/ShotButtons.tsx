import { useEffect, useState } from "react";
import type { Frame } from "@/types";
import {
  useRecordShot,
  useEndBreak,
  useUndoShot,
  useRecordFoul,
} from "@/features/shot/useShotHooks";
import { getShotsByFrame } from "@/features/shot/operations";
import { BALL_COLORS_ORDER } from "@/config/constants";
import FoulModal from "@/components/FoulModal/FoulModal";

interface ShotButtonsProps {
  frame: Frame;
  gameId: number;
  playerOneId: number;
  playerTwoId: number;
  initialRedsCount: number;
}

function ShotButtons({
  frame,
  gameId,
  playerOneId,
  playerTwoId,
  initialRedsCount,
}: ShotButtonsProps) {
  const recordShotMutation = useRecordShot();
  const endBreakMutation = useEndBreak();
  const undoMutation = useUndoShot();
  const recordFoulMutation = useRecordFoul();

  const [hasShotsToUndo, setHasShotsToUndo] = useState(false);
  const [lastShotWasRed, setLastShotWasRed] = useState(false);
  const [isLastRedColorChoice, setIsLastRedColorChoice] = useState(false);
  const [strictOrderIndex, setStrictOrderIndex] = useState(0);
  const [showFoulModal, setShowFoulModal] = useState(false);
  const [isFreeBallMode, setIsFreeBallMode] = useState(false);

  useEffect(() => {
    const updateShotState = async () => {
      if (!frame.id) return;

      const shots = await getShotsByFrame(frame.id);
      setHasShotsToUndo(shots.length > 0);

      const lastShot = shots[shots.length - 1];

      if (!lastShot || lastShot.playerId !== frame.currentPlayerTurn) {
        setLastShotWasRed(false);
      } else {
        const lastNonFoulShotByCurrentPlayer = [...shots]
          .reverse()
          .find(
            (s) =>
              s.ballType !== "foul" && s.playerId === frame.currentPlayerTurn
          );

        setLastShotWasRed(lastNonFoulShotByCurrentPlayer?.ballType === "red");
      }

      const isLastRedJustPotted =
        frame.redsRemaining === 0 && lastShot?.ballType === "red";

      setIsLastRedColorChoice(isLastRedJustPotted);

      if (frame.redsRemaining === 0 && !isLastRedJustPotted) {
        let strictOrderColorsPotted = 0;
        let redsCount = initialRedsCount;
        let lastRedPotterId: number | null = null;
        let freeColorUsed = false;
        let breakEndedAfterLastRed = false;

        for (const shot of shots) {
          if (shot.ballType === "red") {
            redsCount--;
            if (redsCount === 0) {
              // Track who potted the last red
              lastRedPotterId = shot.playerId;
              breakEndedAfterLastRed = false;
            }
          } else if (shot.ballType === "foul" && redsCount <= 0) {
            // A foul/break-end after the last red forfeits the free colour choice
            breakEndedAfterLastRed = true;
          } else if (shot.ballType !== "foul" && redsCount <= 0) {
            // Colour potted after all reds are gone
            // Only count as free choice if: same player who potted last red AND no break ended
            if (!freeColorUsed && !breakEndedAfterLastRed && shot.playerId === lastRedPotterId) {
              freeColorUsed = true;
            } else {
              // All other colours are strict order
              strictOrderColorsPotted++;
            }
          }
        }

        setStrictOrderIndex(strictOrderColorsPotted);
      }
    };

    void updateShotState();
  }, [frame, initialRedsCount]);

  const isRedsPhase = frame.redsRemaining > 0;
  const isStrictOrderPhase = !isRedsPhase && !isLastRedColorChoice;

  const handlePot = async (
    ballType: "red" | "yellow" | "green" | "brown" | "blue" | "pink" | "black"
  ) => {
    try {
      // Calculate free ball actual points if in free ball mode
      // Free ball scores as the value of the actual ball on (not the nominated ball)
      let freeBallActualPoints: number | undefined;
      if (isFreeBallMode) {
        if (isRedsPhase) {
          // During reds phase, free ball is worth 1 (red value)
          freeBallActualPoints = 1;
        } else if (isStrictOrderPhase) {
          // During strict order phase, free ball is worth the current color on
          const currentColorOn = BALL_COLORS_ORDER[strictOrderIndex];
          const BALL_POINTS: Record<string, number> = {
            yellow: 2, green: 3, brown: 4, blue: 5, pink: 6, black: 7
          };
          freeBallActualPoints = BALL_POINTS[currentColorOn];
        } else {
          // Last red color choice - free ball worth 1 (treating as red equivalent)
          freeBallActualPoints = 1;
        }
      }

      await recordShotMutation.mutateAsync({
        frame,
        ballType,
        gameId,
        playerOneId,
        isFreeBall: isFreeBallMode,
        freeBallActualPoints,
      });
      
      // Clear free ball mode after the shot is taken
      if (isFreeBallMode) {
        setIsFreeBallMode(false);
      }
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
        isFreeBall: isFreeBallMode,
      });
      
      // Clear free ball mode when ending break
      if (isFreeBallMode) {
        setIsFreeBallMode(false);
      }
    } catch (error) {
      console.error("Failed to end turn:", error);
    }
  };

  const handleUndo = async () => {
    try {
      const deletedShot = await undoMutation.mutateAsync({
        frame,
        gameId,
        playerOneId,
        playerTwoId,
        initialRedsCount,
      });
      
      // Handle free ball mode based on what was undone
      if (deletedShot?.isFreeBall) {
        // Undoing a free ball shot - restore free ball mode
        setIsFreeBallMode(true);
      } else if (isFreeBallMode) {
        // Undoing something else while in free ball mode - clear it
        setIsFreeBallMode(false);
      }
    } catch (error) {
      console.error("Failed to undo:", error);
    }
  };

  const handleFoul = async (foulPoints: number, isFreeBall: boolean) => {
    try {
      await recordFoulMutation.mutateAsync({
        frame,
        foulPoints,
        gameId,
        playerOneId,
        playerTwoId,
        isFreeBall,
      });
      
      // If free ball is awarded, set free ball mode for the incoming player
      if (isFreeBall) {
        setIsFreeBallMode(true);
      }
    } catch (error) {
      console.error("Failed to record foul:", error);
    }
  };

  const isColorAllowedInStrictOrder = (colorName: string) => {
    if (!isStrictOrderPhase) return true;
    return BALL_COLORS_ORDER[strictOrderIndex] === colorName;
  };

  // In free ball mode, all balls including reds are enabled for nomination
  const redEnabled = (isRedsPhase && !recordShotMutation.isPending) || isFreeBallMode;

  const computeColorEnabled = (color: (typeof BALL_COLORS_ORDER)[number]) => {
    if (recordShotMutation.isPending) return false;

    // In free ball mode, all colors are enabled
    if (isFreeBallMode) {
      return true;
    }

    if (isRedsPhase) {
      return lastShotWasRed;
    }

    if (isLastRedColorChoice) {
      return true;
    }

    return isColorAllowedInStrictOrder(color);
  };

  const yellowEnabled = computeColorEnabled("yellow");
  const greenEnabled = computeColorEnabled("green");
  const brownEnabled = computeColorEnabled("brown");
  const blueEnabled = computeColorEnabled("blue");
  const pinkEnabled = computeColorEnabled("pink");
  const blackEnabled = computeColorEnabled("black");

  return (
    <div>
      <div>
        <button onClick={() => handlePot("red")} disabled={!redEnabled}>
          Red ({isFreeBallMode && isRedsPhase ? 1 : frame.redsRemaining})
        </button>
      </div>

      <div>
        <button onClick={() => handlePot("yellow")} disabled={!yellowEnabled}>
          Yellow ({isFreeBallMode && isRedsPhase ? 1 : 2})
        </button>
        <button onClick={() => handlePot("green")} disabled={!greenEnabled}>
          Green ({isFreeBallMode && isRedsPhase ? 1 : 3})
        </button>
        <button onClick={() => handlePot("brown")} disabled={!brownEnabled}>
          Brown ({isFreeBallMode && isRedsPhase ? 1 : 4})
        </button>
        <button onClick={() => handlePot("blue")} disabled={!blueEnabled}>
          Blue ({isFreeBallMode && isRedsPhase ? 1 : 5})
        </button>
        <button onClick={() => handlePot("pink")} disabled={!pinkEnabled}>
          Pink ({isFreeBallMode && isRedsPhase ? 1 : 6})
        </button>
        <button onClick={() => handlePot("black")} disabled={!blackEnabled}>
          Black ({isFreeBallMode && isRedsPhase ? 1 : 7})
        </button>
      </div>

      <div>
        <button onClick={handleEndBreak} disabled={endBreakMutation.isPending}>
          {endBreakMutation.isPending ? "Switching..." : "End Break"}
        </button>

        <button
          onClick={() => setShowFoulModal(true)}
          disabled={recordFoulMutation.isPending}
        >
          {recordFoulMutation.isPending ? "Recording..." : "Foul"}
        </button>

        <button
          onClick={handleUndo}
          disabled={undoMutation.isPending || !hasShotsToUndo}
        >
          {undoMutation.isPending ? "Undoing..." : "Undo"}
        </button>
      </div>

      <FoulModal
        isOpen={showFoulModal}
        onClose={() => setShowFoulModal(false)}
        onSelectFoul={handleFoul}
      />
    </div>
  );
}

export default ShotButtons;
