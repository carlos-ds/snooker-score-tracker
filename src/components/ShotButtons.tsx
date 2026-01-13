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
import FoulModal from "./FoulModal/FoulModal";
import "./ShotButtons.css";

interface ShotButtonsProps {
  frame: Frame;
  gameId: number;
  playerOneId: number;
  playerTwoId: number;
  onFrameComplete?: (winnerId: number) => void;
}

function ShotButtons({
  frame,
  gameId,
  playerOneId,
  playerTwoId,
  onFrameComplete,
}: ShotButtonsProps) {
  const recordShotMutation = useRecordShot();
  const endBreakMutation = useEndBreak();
  const undoMutation = useUndoShot();
  const recordFoulMutation = useRecordFoul();

  const [hasShotsToUndo, setHasShotsToUndo] = useState(false);
  const [lastShotWasRed, setLastShotWasRed] = useState(false);
  const [isLastRedColorChoice, setIsLastRedColorChoice] = useState(false);
  const [strictOrderIndex, setStrictOrderIndex] = useState(0);
  const [isFrameComplete, setIsFrameComplete] = useState(false);
  const [isFoulModalOpen, setIsFoulModalOpen] = useState(false);

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

      // Check if frame is complete: all reds potted and black just potted
      const isBlackJustPotted = lastShot?.ballType === "black";
      const frameComplete = frame.redsRemaining === 0 && isBlackJustPotted;
      setIsFrameComplete(frameComplete);

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
    };

    void updateShotState();
  }, [frame]);

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
      });
    } catch (error) {
      console.error("Failed to undo:", error);
    }
  };

  const handleFoul = async (foulPoints: number) => {
    try {
      await recordFoulMutation.mutateAsync({
        frame,
        foulPoints,
        gameId,
        playerOneId,
        playerTwoId,
      });
      setIsFoulModalOpen(false);
    } catch (error) {
      console.error("Failed to record foul:", error);
    }
  };

  const handleEndFrame = () => {
    // Determine winner based on score
    const winnerId = frame.playerOneScore > frame.playerTwoScore 
      ? playerOneId 
      : playerTwoId;
    
    if (onFrameComplete) {
      onFrameComplete(winnerId);
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
    <div className="shot-buttons">
      <div className="shot-buttons__reds">
        <button 
          className="shot-button red"
          onClick={() => handlePot("red")} 
          disabled={!redEnabled}
        >
          <span className="shot-button-points">({frame.redsRemaining})</span>
        </button>
      </div>

      <div className="shot-buttons__colors">
        <button 
          className="shot-button yellow"
          onClick={() => handlePot("yellow")} 
          disabled={!yellowEnabled}
        >
        </button>
        <button 
          className="shot-button green"
          onClick={() => handlePot("green")} 
          disabled={!greenEnabled}
        >
        </button>
        <button 
          className="shot-button brown"
          onClick={() => handlePot("brown")} 
          disabled={!brownEnabled}
        >
        </button>
        <button 
          className="shot-button blue"
          onClick={() => handlePot("blue")} 
          disabled={!blueEnabled}
        >
        </button>
        <button 
          className="shot-button pink"
          onClick={() => handlePot("pink")} 
          disabled={!pinkEnabled}
        >
        </button>
        <button 
          className="shot-button black"
          onClick={() => handlePot("black")} 
          disabled={!blackEnabled}
        >
        </button>
      </div>

      <div className="shot-buttons__actions">
        {isFrameComplete && (
          <button 
            className="shot-button action"
            onClick={handleEndFrame}
            style={{ backgroundColor: '#16a34a' }}
          >
            End Frame
          </button>
        )}

        <button 
          className="shot-button action"
          onClick={handleEndBreak} 
          disabled={endBreakMutation.isPending || isFrameComplete}
        >
          {endBreakMutation.isPending ? "Switching..." : "End Break"}
        </button>

        <button
          className="shot-button action"
          onClick={handleUndo}
          disabled={undoMutation.isPending || !hasShotsToUndo}
        >
          {undoMutation.isPending ? "Undoing..." : "Undo"}
        </button>

        <button
          className="shot-button action foul"
          onClick={() => setIsFoulModalOpen(true)}
          disabled={recordFoulMutation.isPending || isFrameComplete}
        >
          Foul
        </button>
      </div>

      <FoulModal
        isOpen={isFoulModalOpen}
        onClose={() => setIsFoulModalOpen(false)}
        onSelectFoulPoints={handleFoul}
        isPending={recordFoulMutation.isPending}
      />
    </div>
  );
}

export default ShotButtons;
