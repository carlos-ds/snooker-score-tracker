import { useEffect, useState } from "react";
import type { Frame, Player } from "@/types";
import {
  useRecordShot,
  useEndBreak,
  useUndoShot,
  useRecordFoul,
} from "@/features/shot/useShotHooks";
import { useUpdateFrameScore } from "@/features/frame/useFrameHooks";
import { getShotsByFrame } from "@/features/shot/operations";
import { BALL_COLORS_ORDER } from "@/config/constants";
import FoulModal from "@/components/FoulModal/FoulModal";
import CoinTossModal from "@/components/CoinTossModal";

import './ShotButtons.css'

interface ShotButtonsProps {
  frame: Frame;
  gameId: number;
  playerOne: Player;
  playerTwo: Player;
  initialRedsCount: number;
}

function ShotButtons({
  frame,
  gameId,
  playerOne,
  playerTwo,
  initialRedsCount,
}: ShotButtonsProps) {
  const playerOneId = playerOne.id!;
  const playerTwoId = playerTwo.id!;
  const recordShotMutation = useRecordShot();
  const endBreakMutation = useEndBreak();
  const undoMutation = useUndoShot();
  const recordFoulMutation = useRecordFoul();
  const updateFrameScoreMutation = useUpdateFrameScore();

  const [hasShotsToUndo, setHasShotsToUndo] = useState(false);
  const [lastShotWasRed, setLastShotWasRed] = useState(false);
  const [isLastRedColorChoice, setIsLastRedColorChoice] = useState(false);
  const [strictOrderIndex, setStrictOrderIndex] = useState(0);
  const [showFoulModal, setShowFoulModal] = useState(false);
  const [isFreeBallMode, setIsFreeBallMode] = useState(false);
  const [showCoinToss, setShowCoinToss] = useState(false);

  // Show coin toss when entering respotted black phase
  useEffect(() => {
    if (frame.isRespottedBlack && !frame.respottedBlackFirstPlayerId) {
      setShowCoinToss(true);
    } else {
      setShowCoinToss(false);
    }
  }, [frame.isRespottedBlack, frame.respottedBlackFirstPlayerId]);

  const handleCoinTossChoice = async (chosenPlayerId: number) => {
    if (!frame.id) return;
    await updateFrameScoreMutation.mutateAsync({
      frameId: frame.id,
      updates: {
        respottedBlackFirstPlayerId: chosenPlayerId,
        currentPlayerTurn: chosenPlayerId,
      },
      gameId,
    });
    setShowCoinToss(false);
  };

  useEffect(() => {
    const updateShotState = async () => {
      if (!frame.id) return;

      const shots = await getShotsByFrame(frame.id);
      
      // During respotted black phase, only allow undoing shots made during this phase
      if (frame.isRespottedBlack && frame.respottedBlackShotCount !== undefined) {
        setHasShotsToUndo(shots.length > frame.respottedBlackShotCount);
      } else {
        setHasShotsToUndo(shots.length > 0);
      }

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

        // A shot counts as "red potted" if:
        // 1. It was an actual red, OR
        // 2. It was a free ball during reds phase (any colour nominated as "free red")
        //    In this case, after potting the free ball, player can pot any colour
        const wasActualRed = lastNonFoulShotByCurrentPlayer?.ballType === "red";
        const wasFreeBallDuringRedsPhase = 
          lastNonFoulShotByCurrentPlayer?.isFreeBall && 
          lastNonFoulShotByCurrentPlayer?.ballType !== "red" &&
          frame.redsRemaining > 0;
        
        setLastShotWasRed(Boolean(wasActualRed || wasFreeBallDuringRedsPhase));
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
          if (shot.ballType === "red" && !shot.isFreeBall) {
            // Only count actual reds, not free ball nominations (which are re-spotted)
            redsCount--;
            if (redsCount === 0) {
              // Track who potted the last red
              lastRedPotterId = shot.playerId;
              breakEndedAfterLastRed = false;
            }
          } else if (shot.ballType === "foul" && redsCount <= 0) {
            // A foul/break-end after the last red forfeits the free colour choice
            breakEndedAfterLastRed = true;
          } else if (shot.ballType !== "foul" && shot.ballType !== "red" && redsCount <= 0) {
            // Colour potted after all reds are gone
            // Free ball shots are re-spotted and do NOT advance the sequence
            // Only count non-free-ball colours as advancing the strict order
            if (shot.isFreeBall) {
              // Free ball in strict colours phase - ball is re-spotted, sequence does NOT advance
              // The actual ball "on" is still pending
              continue;
            }
            
            // Only count as free choice if: same player who potted last red AND no break ended
            if (!freeColorUsed && !breakEndedAfterLastRed && shot.playerId === lastRedPotterId) {
              freeColorUsed = true;
            } else {
              // All other colours are strict order - this advances the sequence
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

  const handleFoul = async (foulPoints: number, isFreeBall: boolean, isMiss: boolean, foulBallName?: string) => {
    try {
      await recordFoulMutation.mutateAsync({
        frame,
        foulPoints,
        gameId,
        playerOneId,
        playerTwoId,
        isFreeBall,
        isMiss,
        ballType: foulBallName as any,
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

  // In free ball mode during reds phase, all balls including reds are enabled for nomination
  // After all reds are gone, only colours can be nominated as free ball (red is not on the table)
  const redEnabled = isRedsPhase && (!recordShotMutation.isPending || isFreeBallMode);

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

  // During respotted black, only black is enabled
  const isRespottedBlackPhase = !!(frame.isRespottedBlack && frame.respottedBlackFirstPlayerId);

  const yellowEnabled = isRespottedBlackPhase ? false : computeColorEnabled("yellow");
  const greenEnabled = isRespottedBlackPhase ? false : computeColorEnabled("green");
  const brownEnabled = isRespottedBlackPhase ? false : computeColorEnabled("brown");
  const blueEnabled = isRespottedBlackPhase ? false : computeColorEnabled("blue");
  const pinkEnabled = isRespottedBlackPhase ? false : computeColorEnabled("pink");
  const blackEnabled = isRespottedBlackPhase ? !recordShotMutation.isPending : computeColorEnabled("black");

  // Helper to get the correct display points for free ball mode
  // Free ball always scores as the value of the ball "on", not the nominated ball
  const getFreeBallDisplayPoints = (): number => {
    if (isRedsPhase) {
      // During reds phase, free ball is worth 1 (red value)
      return 1;
    } else if (isStrictOrderPhase) {
      // During strict order phase, free ball is worth the current color on
      const BALL_POINTS: Record<string, number> = {
        yellow: 2, green: 3, brown: 4, blue: 5, pink: 6, black: 7
      };
      const currentColorOn = BALL_COLORS_ORDER[strictOrderIndex];
      return BALL_POINTS[currentColorOn];
    } else {
      // Last red color choice - free ball worth 1 (treating as red equivalent)
      return 1;
    }
  };

  const freeBallPoints = isFreeBallMode ? getFreeBallDisplayPoints() : null;

  return (
    <div className="shot-buttons">
      <div className="shot-buttons__header">
        <button
          className="shot-buttons__action-btn"
          onClick={handleUndo}
          disabled={undoMutation.isPending || !hasShotsToUndo}
        >
          {undoMutation.isPending ? "..." : "Undo"}
        </button>
        <button 
          onClick={handleEndBreak} 
          disabled={endBreakMutation.isPending}
          className="shot-buttons__action-btn"
        >
          {endBreakMutation.isPending ? "..." : "End Break"}
        </button>
      </div>
      <div className="shot-buttons__body">
        <button className="shot-buttons__button shot-buttons__button--red" onClick={() => handlePot("red")} disabled={!redEnabled}>
          {isFreeBallMode ? freeBallPoints : frame.redsRemaining}
        </button>
        <button className="shot-buttons__button shot-buttons__button--yellow" onClick={() => handlePot("yellow")} disabled={!yellowEnabled}>
          {isFreeBallMode ? freeBallPoints : 2}
        </button>
        <button className="shot-buttons__button shot-buttons__button--green" onClick={() => handlePot("green")} disabled={!greenEnabled}>
          {isFreeBallMode ? freeBallPoints : 3}
        </button>
        <button className="shot-buttons__button shot-buttons__button--brown" onClick={() => handlePot("brown")} disabled={!brownEnabled}>
          {isFreeBallMode ? freeBallPoints : 4}
        </button>
        <button className="shot-buttons__button shot-buttons__button--blue" onClick={() => handlePot("blue")} disabled={!blueEnabled}>
          {isFreeBallMode ? freeBallPoints : 5}
        </button>
        <button className="shot-buttons__button shot-buttons__button--pink" onClick={() => handlePot("pink")} disabled={!pinkEnabled}>
          {isFreeBallMode ? freeBallPoints : 6}
        </button>
        <button className="shot-buttons__button shot-buttons__button--black" onClick={() => handlePot("black")} disabled={!blackEnabled}>
          {isFreeBallMode ? freeBallPoints : 7}
        </button>
        <button
          className="shot-buttons__button shot-buttons__button--foul"
          onClick={() => setShowFoulModal(true)}
          disabled={recordFoulMutation.isPending}
        >
          {recordFoulMutation.isPending ? "..." : "!"}
        </button>
      </div>

      <FoulModal
        isOpen={showFoulModal}
        onClose={() => setShowFoulModal(false)}
        onSelectFoul={handleFoul}
      />

      <CoinTossModal
        isOpen={showCoinToss}
        playerOne={playerOne}
        playerTwo={playerTwo}
        onChooseFirstPlayer={handleCoinTossChoice}
      />
    </div>
  );
}

export default ShotButtons;
