import { useEffect, useState } from "react";
import type { Frame } from "@/types";
import {
  useRecordShot,
  useEndBreak,
  useUndoShot,
} from "@/features/shot/useShotHooks";
import { getShotsByFrame } from "@/features/shot/operations";
import { BALL_COLORS_ORDER } from "@/config/constants";

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

  const [hasShotsToUndo, setHasShotsToUndo] = useState(false);
  const [lastShotWasRed, setLastShotWasRed] = useState(false);
  const [isLastRedColorChoice, setIsLastRedColorChoice] = useState(false);
  const [strictOrderIndex, setStrictOrderIndex] = useState(0);

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
        let colorsPottedAfterReds = 0;
        let redsCount = initialRedsCount;

        for (const shot of shots) {
          if (shot.ballType === "red") {
            redsCount--;
          } else if (shot.ballType !== "foul" && redsCount <= 0) {
            colorsPottedAfterReds++;
          }
        }

        setStrictOrderIndex(Math.max(0, colorsPottedAfterReds - 1));
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
      await recordShotMutation.mutateAsync({
        frame,
        ballType,
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
        initialRedsCount,
      });
    } catch (error) {
      console.error("Failed to undo:", error);
    }
  };

  const isColorAllowedInStrictOrder = (colorName: string) => {
    if (!isStrictOrderPhase) return true;
    return BALL_COLORS_ORDER[strictOrderIndex] === colorName;
  };

  const redEnabled = isRedsPhase && !recordShotMutation.isPending;

  const computeColorEnabled = (color: (typeof BALL_COLORS_ORDER)[number]) => {
    if (recordShotMutation.isPending) return false;

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
          Red ({frame.redsRemaining})
        </button>
      </div>

      <div>
        <button onClick={() => handlePot("yellow")} disabled={!yellowEnabled}>
          Yellow (2)
        </button>
        <button onClick={() => handlePot("green")} disabled={!greenEnabled}>
          Green (3)
        </button>
        <button onClick={() => handlePot("brown")} disabled={!brownEnabled}>
          Brown (4)
        </button>
        <button onClick={() => handlePot("blue")} disabled={!blueEnabled}>
          Blue (5)
        </button>
        <button onClick={() => handlePot("pink")} disabled={!pinkEnabled}>
          Pink (6)
        </button>
        <button onClick={() => handlePot("black")} disabled={!blackEnabled}>
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
