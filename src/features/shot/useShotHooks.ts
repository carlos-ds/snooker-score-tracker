import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS, BALL_POINTS } from "@/config/constants";
import { recordShot, deleteLastShot, getShotsByFrame } from "./operations";
import { updateFrameScore, completeFrame, getFramesByGame, createFrame } from "@/features/frame/operations";
import { getGameById, completeActiveGame } from "@/features/game/operations";
import { recalculateFrameState } from "./utils/shotCalculations";
import type { Frame, BallType } from "@/types";

interface RecordShotParams {
  frame: Frame;
  ballType: Exclude<BallType, "foul">;
  gameId: number;
  playerOneId: number;
}

// Hook to record a shot and update frame state.
export function useRecordShot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      frame,
      ballType,
      playerOneId,
      gameId,
    }: RecordShotParams) => {
      if (!frame.id) {
        throw new Error("Frame ID is required");
      }

      const currentPlayerId = frame.currentPlayerTurn;
      const isPlayerOne = currentPlayerId === playerOneId;
      const points = BALL_POINTS[ballType];

      // Calculate new scores
      const currentScore = isPlayerOne
        ? frame.playerOneScore
        : frame.playerTwoScore;
      const currentBreak = isPlayerOne
        ? frame.playerOneBreak
        : frame.playerTwoBreak;

      const newScore = currentScore + points;
      const newBreak = currentBreak + points;
      const newRedsRemaining =
        ballType === "red" ? frame.redsRemaining - 1 : frame.redsRemaining;

      // Record shot
      await recordShot({
        frameId: frame.id,
        playerId: currentPlayerId,
        ballType,
        points,
        isFoul: false,
      });

      // Update frame
      const updates = {
        ...(isPlayerOne
          ? {
              playerOneScore: newScore,
              playerOneBreak: newBreak,
            }
          : {
              playerTwoScore: newScore,
              playerTwoBreak: newBreak,
            }),
        redsRemaining: newRedsRemaining,
      };

      await updateFrameScore(frame.id, updates);

      // --- Check for Final Black Frame Completion ---
      // "A frame usually ends when the final black ball is potted, provided the scores are not tied."
      if (ballType === "black" && frame.redsRemaining === 0) {
        // Fetch shots to verify this is the Final Black (clearance phase) and not a Black-after-Red
        const shots = await getShotsByFrame(frame.id);
        
        // If it's the only shot (rare) or the previous shot was NOT a red, it's the Final Black.
        // (If previous shot was Red, this is a Color-After-Red, so frame continues).
        const isFinalBlack = shots.length === 1 || (shots.length >= 2 && shots[shots.length - 2].ballType !== "red");

        if (isFinalBlack) {
          const finalP1Score = isPlayerOne ? newScore : frame.playerOneScore;
          const finalP2Score = isPlayerOne ? frame.playerTwoScore : newScore;

          // Only end if scores are not tied
          if (finalP1Score !== finalP2Score) {
            // Retrieve game info for player specifics
            const game = await getGameById(gameId);
            if (game) {
               const winnerId = finalP1Score > finalP2Score ? playerOneId : game.playerTwoId;
               
               // Complete the Frame
               await completeFrame(frame.id, winnerId);

               // --- Check for Match Win ---
               // Get updated list of frames to count wins
               const allFrames = await getFramesByGame(gameId);
               
               const p1Wins = allFrames.filter(f => f.winnerId === playerOneId).length;
               const p2Wins = allFrames.filter(f => f.winnerId === game.playerTwoId).length;
               const winsNeeded = Math.ceil(game.bestOfFrames / 2);

               if (p1Wins >= winsNeeded || p2Wins >= winsNeeded) {
                 await completeActiveGame();
               } else {
                 // Match not over yet - create next frame
                 const nextFrameNumber = allFrames.length + 1;
                 // Loser of previous frame breaks first (standard snooker rule)
                 const nextStartingPlayer = winnerId === playerOneId ? game.playerTwoId : playerOneId;
                 await createFrame({
                   gameId,
                   frameNumber: nextFrameNumber,
                   startingPlayerId: nextStartingPlayer,
                   redsCount: game.redsCount,
                 });
               }
            }
          }
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.ACTIVE_FRAME, variables.gameId],
      });
      // Also invalidate Game queries in case status changed
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVE_GAME });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GAME_FRAMES });
    },
  });
}

interface EndBreakParams {
  frame: Frame;
  gameId: number;
  playerOneId: number;
  playerTwoId: number;
}

// Hook to end the current player's break and switch turns.
export function useEndBreak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ frame, playerOneId, playerTwoId }: EndBreakParams) => {
      if (!frame.id) {
        throw new Error("Frame ID is required");
      }

      const currentPlayerId = frame.currentPlayerTurn;
      const isPlayerOne = currentPlayerId === playerOneId;

      // Record an "end break" marker using foul type
      await recordShot({
        frameId: frame.id,
        playerId: currentPlayerId,
        ballType: "foul",
        points: 0,
        isFoul: false,
      });

      // Switch to other player and reset breaks
      const nextPlayerId = isPlayerOne ? playerTwoId : playerOneId;

      await updateFrameScore(frame.id, {
        currentPlayerTurn: nextPlayerId,
        playerOneBreak: 0,
        playerTwoBreak: 0,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.ACTIVE_FRAME, variables.gameId],
      });
    },
  });
}

interface UndoShotParams {
  frame: Frame;
  gameId: number;
  playerOneId: number;
  playerTwoId: number;
  initialRedsCount: number;
}

// Hook to undo the last shot and recalculate frame state.
export function useUndoShot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      frame,
      playerOneId,
      playerTwoId,
      initialRedsCount,
    }: UndoShotParams) => {
      if (!frame.id) {
        throw new Error("Frame ID is required");
      }

      // Get all shots and verify there's something to undo
      const shots = await getShotsByFrame(frame.id);
      if (shots.length === 0) {
        throw new Error("No shots to undo");
      }

      // Delete the last shot
      await deleteLastShot(frame.id);

      // Recalculate frame state from remaining shots
      const remainingShots = shots.slice(0, -1);
      const updates = recalculateFrameState(
        remainingShots,
        playerOneId,
        playerTwoId,
        playerOneId, // Initial turn is player one
        initialRedsCount
      );

      await updateFrameScore(frame.id, updates);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.ACTIVE_FRAME, variables.gameId],
      });
    },
  });
}

interface RecordFoulParams {
  frame: Frame;
  foulPoints: number;
  gameId: number;
  playerOneId: number;
  playerTwoId: number;
}

// Hook to record a foul and award points to the opponent.
export function useRecordFoul() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      frame,
      foulPoints,
      playerOneId,
      playerTwoId,
    }: RecordFoulParams) => {
      if (!frame.id) {
        throw new Error("Frame ID is required");
      }

      const currentPlayerId = frame.currentPlayerTurn;
      const isPlayerOne = currentPlayerId === playerOneId;
      const opponentId = isPlayerOne ? playerTwoId : playerOneId;

      // Record the foul shot
      await recordShot({
        frameId: frame.id,
        playerId: currentPlayerId,
        ballType: "foul",
        points: 0,
        isFoul: true,
        foulPoints,
      });

      // Award foul points to opponent's score
      const newOpponentScore = isPlayerOne
        ? frame.playerTwoScore + foulPoints
        : frame.playerOneScore + foulPoints;

      // Update frame: switch turn, reset breaks, add points to opponent
      const updates = {
        currentPlayerTurn: opponentId,
        playerOneBreak: 0,
        playerTwoBreak: 0,
        ...(isPlayerOne
          ? { playerTwoScore: newOpponentScore }
          : { playerOneScore: newOpponentScore }),
      };

      await updateFrameScore(frame.id, updates);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.ACTIVE_FRAME, variables.gameId],
      });
    },
  });
}

