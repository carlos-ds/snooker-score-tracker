import { useEffect, useState } from "react";
import type { Frame } from "@/types";
import {
  useRecordShot,
  useEndBreak,
  useUndoShot,
  useRecordFoul,
  useEnableFreeBall,
  useRecordFreeBallShot,
} from "@/features/shot/useShotHooks";
import { getShotsByFrame } from "@/features/shot/operations";
import { BALL_COLORS_ORDER } from "@/config/constants";
import FoulModal from "@/components/FoulModal/FoulModal";
import "./ShotButtons.css";

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
  const recordShotMutation = useRecordShot();
  const endBreakMutation = useEndBreak();
  const undoMutation = useUndoShot();
  const recordFoulMutation = useRecordFoul();
  const enableFreeBallMutation = useEnableFreeBall();
  const recordFreeBallShotMutation = useRecordFreeBallShot();

  const [hasShotsToUndo, setHasShotsToUndo] = useState(false);
  const [lastShotWasRed, setLastShotWasRed] = useState(false);
  const [lastShotWasFreeBall, setLastShotWasFreeBall] = useState(false);
  const [isLastRedColorChoice, setIsLastRedColorChoice] = useState(false);
  const [strictOrderIndex, setStrictOrderIndex] = useState(0);
  const [isFoulModalOpen, setIsFoulModalOpen] = useState(false);

  useEffect(() => {
    const updateShotState = async () => {
      if (!frame.id) return;

      const shots = await getShotsByFrame(frame.id);
      setHasShotsToUndo(shots.length > 0);

      const lastShot = shots[shots.length - 1];

      if (!lastShot || lastShot.playerId !== frame.currentPlayerTurn) {
        setLastShotWasRed(false);
        setLastShotWasFreeBall(false);
      } else {
        const lastNonFoulShotByCurrentPlayer = [...shots]
          .reverse()
          .find(
            (s) =>
              s.ballType !== "foul" && s.playerId === frame.currentPlayerTurn
          );

        setLastShotWasRed(lastNonFoulShotByCurrentPlayer?.ballType === "red");
        setLastShotWasFreeBall(lastNonFoulShotByCurrentPlayer?.ballType === "freeball");
      }

      const isLastRedJustPotted =
        frame.redsRemaining === 0 && lastShot?.ballType === "red";

      setIsLastRedColorChoice(isLastRedJustPotted);

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

  const handleFoul = async (foulPoints: number, isFreeBall: boolean) => {
    try {
      await recordFoulMutation.mutateAsync({
        frame,
        foulPoints,
        gameId,
        playerOneId,
        playerTwoId,
      });
      
      if (isFreeBall) {
        await enableFreeBallMutation.mutateAsync({
          frame,
          gameId,
        });
      }
      
      setIsFoulModalOpen(false);
    } catch (error) {
      console.error("Failed to record foul:", error);
    }
  };

  const handleFreeBallPot = async () => {
    try {
      await recordFreeBallShotMutation.mutateAsync({
        frame,
        gameId,
        playerOneId,
      });
    } catch (error) {
      console.error("Failed to record free ball:", error);
    }
  };

  const isColorAllowedInStrictOrder = (colorName: string) => {
    if (!isStrictOrderPhase) return true;
    return BALL_COLORS_ORDER[strictOrderIndex] === colorName;
  };

  const redEnabled = isRedsPhase && !recordShotMutation.isPending;

  const computeColorEnabled = (color: (typeof BALL_COLORS_ORDER)[number]) => {
    if (recordShotMutation.isPending || recordFreeBallShotMutation.isPending) return false;

    if (isRedsPhase) {
      return lastShotWasRed || lastShotWasFreeBall;
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
      {/* Free Ball mode */}
      {frame.isFreeBall && (
        <div>
          <p>Free Ball</p>
          <div className="shot-buttons__balls">
            {BALL_COLORS_ORDER.map((color) => (
              <button
                key={color}
                className="shot-button"
                onClick={handleFreeBallPot}
                disabled={recordFreeBallShotMutation.isPending}
              >
                <span>{color}</span>
                <span>+1</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Normal mode */}
      {!frame.isFreeBall && (
        <div className="shot-buttons__balls">
          <button 
            className="shot-button"
            onClick={() => handlePot("red")} 
            disabled={!redEnabled}
          >
            <span>Red</span>
            <span>1 ({frame.redsRemaining})</span>
          </button>
          <button 
            className="shot-button"
            onClick={() => handlePot("yellow")} 
            disabled={!yellowEnabled}
          >
            <span>Yellow</span>
            <span>2</span>
          </button>
          <button 
            className="shot-button"
            onClick={() => handlePot("green")} 
            disabled={!greenEnabled}
          >
            <span>Green</span>
            <span>3</span>
          </button>
          <button 
            className="shot-button"
            onClick={() => handlePot("brown")} 
            disabled={!brownEnabled}
          >
            <span>Brown</span>
            <span>4</span>
          </button>
          <button 
            className="shot-button"
            onClick={() => handlePot("blue")} 
            disabled={!blueEnabled}
          >
            <span>Blue</span>
            <span>5</span>
          </button>
          <button 
            className="shot-button"
            onClick={() => handlePot("pink")} 
            disabled={!pinkEnabled}
          >
            <span>Pink</span>
            <span>6</span>
          </button>
          <button 
            className="shot-button"
            onClick={() => handlePot("black")} 
            disabled={!blackEnabled}
          >
            <span>Black</span>
            <span>7</span>
          </button>
          <button
            className="shot-button"
            onClick={() => setIsFoulModalOpen(true)}
            disabled={recordFoulMutation.isPending}
          >
            <span>!</span>
            <span>Foul</span>
          </button>
        </div>
      )}

      <div>
        <button 
          onClick={handleEndBreak} 
          disabled={endBreakMutation.isPending}
        >
          {endBreakMutation.isPending ? "Switching..." : "End Break"}
        </button>

        <button
          onClick={handleUndo}
          disabled={undoMutation.isPending || !hasShotsToUndo}
        >
          {undoMutation.isPending ? "Undoing..." : "Undo"}
        </button>
      </div>

      <FoulModal
        isOpen={isFoulModalOpen}
        onClose={() => setIsFoulModalOpen(false)}
        onSelectFoul={handleFoul}
        isPending={recordFoulMutation.isPending || enableFreeBallMutation.isPending}
      />
    </div>
  );
}

export default ShotButtons;
