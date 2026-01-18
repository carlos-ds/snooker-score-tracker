import type { Shot, FrameScoreUpdate } from "@/types";
import { SNOOKER_RULES } from "@/config/constants";

// Utility functions for shot related calculations

// Recalculates the frame state based on all shots taken
export function recalculateFrameState(
  shots: Shot[],
  playerOneId: number,
  playerTwoId: number,
  initialTurn: number,
  initialRedsCount: number
): FrameScoreUpdate {
  let playerOneScore = SNOOKER_RULES.INITIAL_SCORE;
  let playerTwoScore = SNOOKER_RULES.INITIAL_SCORE;
  let playerOneBreak: number = SNOOKER_RULES.INITIAL_BREAK;
  let playerTwoBreak: number = SNOOKER_RULES.INITIAL_BREAK;
  let redsRemaining = initialRedsCount;
  let currentPlayerTurn = initialTurn;
  let playerOneMissCount = 0;
  let playerTwoMissCount = 0;

  // Replay all shots to recalculate state
  for (const shot of shots) {
    // Handle foul shots - award foul points to opponent
    if (shot.ballType === "foul" && shot.isFoul && shot.foulPoints) {
      // Foul points go to the opponent of the fouling player
      if (shot.playerId === playerOneId) {
        playerTwoScore += shot.foulPoints;
        // Handle miss counter for player one
        if (shot.isMiss) {
          playerOneMissCount++;
        } else {
          playerOneMissCount = 0;
        }
      } else {
        playerOneScore += shot.foulPoints;
        // Handle miss counter for player two
        if (shot.isMiss) {
          playerTwoMissCount++;
        } else {
          playerTwoMissCount = 0;
        }
      }
    } else if (shot.ballType !== "foul") {
      // Regular shot (non-foul)
      // Decrement reds counter only for actual reds, not free ball nominations
      // Free ball shots are re-spotted, so they don't affect the reds count
      if (shot.ballType === "red" && !shot.isFreeBall) {
        redsRemaining--;
      }

      // Add to player's score and reset their miss counter
      if (shot.playerId === playerOneId) {
        playerOneScore += shot.points;
        playerOneMissCount = 0;
      } else {
        playerTwoScore += shot.points;
        playerTwoMissCount = 0;
      }
    }
    // Note: "end break" shots (ballType === "foul" && !isFoul) don't reset miss counters
  }

  // Determine current turn from last shot
  if (shots.length > 0) {
    const lastShot = shots[shots.length - 1];

    if (lastShot.ballType === "foul") {
      // Foul switches turn
      currentPlayerTurn =
        lastShot.playerId === playerOneId ? playerTwoId : playerOneId;
    } else {
      // Regular shot keeps turn
      currentPlayerTurn = lastShot.playerId;
    }
  }

  // Calculate current break
  const breakScores = calculateCurrentBreak(shots, currentPlayerTurn);

  if (currentPlayerTurn === playerOneId) {
    playerOneBreak = breakScores;
  } else {
    playerTwoBreak = breakScores;
  }

  return {
    playerOneScore,
    playerTwoScore,
    playerOneBreak,
    playerTwoBreak,
    redsRemaining,
    currentPlayerTurn,
    playerOneMissCount,
    playerTwoMissCount,
  };
}

// Calculate the current break for the active player
function calculateCurrentBreak(shots: Shot[], currentPlayerId: number): number {
  let breakTotal = 0;

  // Count backwards from the most recent shot
  for (let i = shots.length - 1; i >= 0; i--) {
    const shot = shots[i];

    // Stop at foul markers
    if (shot.ballType === "foul") {
      break;
    }

    // Only count shots by the current player
    if (shot.playerId === currentPlayerId) {
      breakTotal += shot.points;
    } else {
      // Stop when we hit a different player's shot
      break;
    }
  }

  return breakTotal;
}

// Determines if a specific ball type is allowed to be potted.
export function isBallAllowed(
  ballType: string,
  redsRemaining: number,
  lastBallType: string | null,
  strictOrderIndex: number,
  colorOrder: readonly string[]
): boolean {
  const isRedsPhase = redsRemaining > 0;

  // Red ball logic
  if (ballType === "red") {
    return isRedsPhase;
  }

  // Color ball logic
  if (isRedsPhase) {
    // During reds phase, colors only allowed after potting a red
    return lastBallType === "red";
  }

  // Last red just potted - free choice of any color
  if (redsRemaining === 0 && lastBallType === "red") {
    return true;
  }

  // Strict clearance phase - must pot colors in order
  return colorOrder[strictOrderIndex] === ballType;
}
