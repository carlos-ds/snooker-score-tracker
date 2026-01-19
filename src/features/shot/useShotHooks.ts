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
  isFreeBall?: boolean;
  freeBallActualPoints?: number; // The points for the actual ball on (not the nominated ball)
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
      isFreeBall,
      freeBallActualPoints,
    }: RecordShotParams) => {
      if (!frame.id) {
        throw new Error("Frame ID is required");
      }

      const currentPlayerId = frame.currentPlayerTurn;
      const isPlayerOne = currentPlayerId === playerOneId;
      
      // For free ball shots, use the actual ball-on value (e.g., 1 for red)
      // instead of the nominated ball's value
      const points = isFreeBall && freeBallActualPoints !== undefined
        ? freeBallActualPoints
        : BALL_POINTS[ballType];

      // Calculate new scores
      const currentScore = isPlayerOne
        ? frame.playerOneScore
        : frame.playerTwoScore;
      const currentBreak = isPlayerOne
        ? frame.playerOneBreak
        : frame.playerTwoBreak;

      const newScore = currentScore + points;
      const newBreak = currentBreak + points;
      
      // Free ball doesn't affect reds remaining (the nominated ball is respotted)
      // Only decrement reds when an actual red is potted (not a free ball nomination)
      const newRedsRemaining =
        ballType === "red" && !isFreeBall ? frame.redsRemaining - 1 : frame.redsRemaining;

      // Record shot
      await recordShot({
        frameId: frame.id,
        playerId: currentPlayerId,
        ballType,
        points,
        isFoul: false,
        isFreeBall,
      });

      // Update frame - also reset miss counter since a legal shot was made
      const updates = {
        ...(isPlayerOne
          ? {
              playerOneScore: newScore,
              playerOneBreak: newBreak,
              playerOneMissCount: 0,
            }
          : {
              playerTwoScore: newScore,
              playerTwoBreak: newBreak,
              playerTwoMissCount: 0,
            }),
        redsRemaining: newRedsRemaining,
      };

      await updateFrameScore(frame.id, updates);

      // --- Check for Respotted Black Win ---
      // If we're in respotted black phase, potting the black wins the frame immediately
      if (frame.isRespottedBlack && ballType === "black") {
        const winnerId = currentPlayerId;
        await completeFrame(frame.id, winnerId);
        
        const game = await getGameById(gameId);
        if (game) {
          const allFrames = await getFramesByGame(gameId);
          const p1Wins = allFrames.filter(f => f.winnerId === playerOneId).length;
          const p2Wins = allFrames.filter(f => f.winnerId === game.playerTwoId).length;
          const winsNeeded = Math.ceil(game.bestOfFrames / 2);

          if (p1Wins >= winsNeeded || p2Wins >= winsNeeded) {
            await completeActiveGame();
          } else {
            const nextFrameNumber = allFrames.length + 1;
            const nextStartingPlayer = winnerId === playerOneId ? game.playerTwoId : playerOneId;
            await createFrame({
              gameId,
              frameNumber: nextFrameNumber,
              startingPlayerId: nextStartingPlayer,
              redsCount: game.redsCount,
            });
          }
        }
        return;
      }

      // --- Check for Final Black Frame Completion ---
      // "A frame usually ends when the final black ball is potted, provided the scores are not tied."
      // A free ball black is NOT the final black - the actual black must be potted in strict order
      if (ballType === "black" && frame.redsRemaining === 0 && !isFreeBall) {
        // Fetch shots to verify this is the Final Black (clearance phase) and not a Black-after-Red
        const shots = await getShotsByFrame(frame.id);
        
        // If it's the only shot (rare) or the previous shot was NOT a red, it's the Final Black.
        // (If previous shot was Red, this is a Color-After-Red, so frame continues).
        // Also ensure the current shot is not a free ball (already checked above)
        const isFinalBlack = shots.length === 1 || (shots.length >= 2 && shots[shots.length - 2].ballType !== "red");

        if (isFinalBlack) {
          const finalP1Score = isPlayerOne ? newScore : frame.playerOneScore;
          const finalP2Score = isPlayerOne ? frame.playerTwoScore : newScore;

          if (finalP1Score !== finalP2Score) {
            // Scores not tied - normal frame completion
            const game = await getGameById(gameId);
            if (game) {
               const winnerId = finalP1Score > finalP2Score ? playerOneId : game.playerTwoId;
               
               await completeFrame(frame.id, winnerId);

               const allFrames = await getFramesByGame(gameId);
               
               const p1Wins = allFrames.filter(f => f.winnerId === playerOneId).length;
               const p2Wins = allFrames.filter(f => f.winnerId === game.playerTwoId).length;
               const winsNeeded = Math.ceil(game.bestOfFrames / 2);

               if (p1Wins >= winsNeeded || p2Wins >= winsNeeded) {
                 await completeActiveGame();
               } else {
                 const nextFrameNumber = allFrames.length + 1;
                 const nextStartingPlayer = winnerId === playerOneId ? game.playerTwoId : playerOneId;
                 await createFrame({
                   gameId,
                   frameNumber: nextFrameNumber,
                   startingPlayerId: nextStartingPlayer,
                   redsCount: game.redsCount,
                 });
               }
            }
          } else {
            // Scores are tied - enter respotted black phase
            await updateFrameScore(frame.id, {
              isRespottedBlack: true,
              playerOneBreak: 0,
              playerTwoBreak: 0,
            });
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
  isFreeBall?: boolean;
}

// Hook to end the current player's break and switch turns.
export function useEndBreak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ frame, playerOneId, playerTwoId, isFreeBall }: EndBreakParams) => {
      if (!frame.id) {
        throw new Error("Frame ID is required");
      }

      const currentPlayerId = frame.currentPlayerTurn;
      const isPlayerOne = currentPlayerId === playerOneId;

      // Record an "end break" marker using foul type
      // isFreeBall tracks if game was in free ball mode when break ended
      await recordShot({
        frameId: frame.id,
        playerId: currentPlayerId,
        ballType: "foul",
        points: 0,
        isFoul: false,
        isFreeBall,
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
// Returns the deleted shot so caller can handle free ball mode restoration
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

      // Get the last shot before deleting
      const deletedShot = shots[shots.length - 1];

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

      // Return the deleted shot for free ball mode handling
      return deletedShot;
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
  isFreeBall?: boolean;
  isMiss?: boolean;
}

// Hook to record a foul and award points to the opponent.
// Also handles the three-miss rule: if a player commits 3 consecutive misses,
// they lose the frame.
export function useRecordFoul() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      frame,
      foulPoints,
      playerOneId,
      playerTwoId,
      gameId,
      isMiss,
    }: RecordFoulParams) => {
      if (!frame.id) {
        throw new Error("Frame ID is required");
      }

      const currentPlayerId = frame.currentPlayerTurn;
      const isPlayerOne = currentPlayerId === playerOneId;
      const opponentId = isPlayerOne ? playerTwoId : playerOneId;

      // --- Respotted Black Foul: Instant Loss ---
      // Any foul during respotted black phase means the current player loses
      if (frame.isRespottedBlack) {
        // Award 7 points (black ball foul value) to opponent
        const respottedBlackFoulPoints = 7;
        
        await recordShot({
          frameId: frame.id,
          playerId: currentPlayerId,
          ballType: "foul",
          points: 0,
          isFoul: true,
          foulPoints: respottedBlackFoulPoints,
        });

        // Update opponent's score with the 7 foul points
        const newOpponentScore = isPlayerOne
          ? frame.playerTwoScore + respottedBlackFoulPoints
          : frame.playerOneScore + respottedBlackFoulPoints;

        await updateFrameScore(frame.id, isPlayerOne
          ? { playerTwoScore: newOpponentScore }
          : { playerOneScore: newOpponentScore });

        // Opponent wins the frame
        const winnerId = opponentId;
        await completeFrame(frame.id, winnerId);

        const game = await getGameById(gameId);
        if (game) {
          const allFrames = await getFramesByGame(gameId);
          const p1Wins = allFrames.filter(f => f.winnerId === playerOneId).length;
          const p2Wins = allFrames.filter(f => f.winnerId === game.playerTwoId).length;
          const winsNeeded = Math.ceil(game.bestOfFrames / 2);

          if (p1Wins >= winsNeeded || p2Wins >= winsNeeded) {
            await completeActiveGame();
          } else {
            const nextFrameNumber = allFrames.length + 1;
            const nextStartingPlayer = winnerId === playerOneId ? game.playerTwoId : playerOneId;
            await createFrame({
              gameId,
              frameNumber: nextFrameNumber,
              startingPlayerId: nextStartingPlayer,
              redsCount: game.redsCount,
            });
          }
        }
        return;
      }

      // Record the foul shot with miss flag
      await recordShot({
        frameId: frame.id,
        playerId: currentPlayerId,
        ballType: "foul",
        points: 0,
        isFoul: true,
        foulPoints,
        isMiss,
      });

      // Award foul points to opponent's score
      const newOpponentScore = isPlayerOne
        ? frame.playerTwoScore + foulPoints
        : frame.playerOneScore + foulPoints;

      // Calculate new miss count
      const currentMissCount = isPlayerOne
        ? frame.playerOneMissCount
        : frame.playerTwoMissCount;
      
      // If it's a miss, increment the counter; otherwise reset to 0
      const newMissCount = isMiss ? currentMissCount + 1 : 0;

      // Check for three-miss frame loss BEFORE updating the frame
      if (newMissCount >= 3) {
        // Three consecutive misses - opponent wins the frame
        const winnerId = opponentId;
        
        // Complete the frame with opponent as winner
        await completeFrame(frame.id, winnerId);

        // Check for match win
        const game = await getGameById(gameId);
        if (game) {
          const allFrames = await getFramesByGame(gameId);
          
          const p1Wins = allFrames.filter(f => f.winnerId === playerOneId).length;
          const p2Wins = allFrames.filter(f => f.winnerId === game.playerTwoId).length;
          const winsNeeded = Math.ceil(game.bestOfFrames / 2);

          if (p1Wins >= winsNeeded || p2Wins >= winsNeeded) {
            await completeActiveGame();
          } else {
            // Match not over - create next frame
            const nextFrameNumber = allFrames.length + 1;
            // Loser (the player who made 3 misses) breaks first
            const nextStartingPlayer = currentPlayerId;
            await createFrame({
              gameId,
              frameNumber: nextFrameNumber,
              startingPlayerId: nextStartingPlayer,
              redsCount: game.redsCount,
            });
          }
        }
        return; // Frame is over, no need to update scores
      }

      // Update frame: switch turn, reset breaks, add points to opponent
      // Also update the miss counter for the current player
      const updates = {
        currentPlayerTurn: opponentId,
        playerOneBreak: 0,
        playerTwoBreak: 0,
        ...(isPlayerOne
          ? { playerTwoScore: newOpponentScore, playerOneMissCount: newMissCount }
          : { playerOneScore: newOpponentScore, playerTwoMissCount: newMissCount }),
      };

      await updateFrameScore(frame.id, updates);
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

interface ResignFrameParams {
  frame: Frame;
  gameId: number;
  playerOneId: number;
  playerTwoId: number;
}

// Hook to resign the current frame. The current player loses the frame,
// awarding the win to the opponent. Handles match win check and next frame creation.
export function useResignFrame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      frame,
      playerOneId,
      playerTwoId,
      gameId,
    }: ResignFrameParams) => {
      if (!frame.id) {
        throw new Error("Frame ID is required");
      }

      const currentPlayerId = frame.currentPlayerTurn;
      const isPlayerOne = currentPlayerId === playerOneId;
      
      // The opponent wins when the current player resigns
      const winnerId = isPlayerOne ? playerTwoId : playerOneId;

      // Complete the frame with opponent as winner
      await completeFrame(frame.id, winnerId);

      // Check for match win
      const game = await getGameById(gameId);
      if (game) {
        const allFrames = await getFramesByGame(gameId);
        
        const p1Wins = allFrames.filter(f => f.winnerId === playerOneId).length;
        const p2Wins = allFrames.filter(f => f.winnerId === game.playerTwoId).length;
        const winsNeeded = Math.ceil(game.bestOfFrames / 2);

        if (p1Wins >= winsNeeded || p2Wins >= winsNeeded) {
          // Match is won
          await completeActiveGame();
        } else {
          // Match not over - create next frame
          const nextFrameNumber = allFrames.length + 1;
          // Winner of the frame breaks in the next frame (opponent of resigner)
          const nextStartingPlayer = winnerId === playerOneId ? game.playerTwoId : playerOneId;
          await createFrame({
            gameId,
            frameNumber: nextFrameNumber,
            startingPlayerId: nextStartingPlayer,
            redsCount: game.redsCount,
          });
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
