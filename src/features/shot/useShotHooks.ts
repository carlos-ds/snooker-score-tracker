import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS, BALL_POINTS } from "@/config/constants";
import { recordShot, deleteLastShot, getShotsByFrame } from "./operations";
import { updateFrameScore, completeFrame } from "@/features/frame/operations";
import { recalculateFrameState } from "./utils/shotCalculations";
import type { Frame, BallType } from "@/types";

interface RecordShotParams {
  frame: Frame;
  ballType: Exclude<BallType, "foul" | "freeball">;
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

      // Update frame scores
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

      // Check if frame is complete (black potted in strict order phase)
      const isBlackPotted = ballType === "black";
      const isStrictOrderPhase = frame.redsRemaining === 0;
      
      const wasAlreadyInStrictOrder = frame.redsRemaining === 0 && ballType !== "red";
      
      if (isBlackPotted && isStrictOrderPhase && wasAlreadyInStrictOrder) {
        // Frame complete, determine winner by comparing final scores
        const finalPlayerOneScore = isPlayerOne ? newScore : frame.playerOneScore;
        const finalPlayerTwoScore = isPlayerOne ? frame.playerTwoScore : newScore;
        
        // Determine winner (higher score wins)
        const winnerId = finalPlayerOneScore > finalPlayerTwoScore 
          ? playerOneId 
          : frame.currentPlayerTurn === playerOneId ? frame.currentPlayerTurn : playerOneId;
        
        await completeFrame(frame.id, winnerId);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.ACTIVE_FRAME, variables.gameId],
      });
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.GAME_FRAMES, variables.gameId],
      });
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

interface RecordFoulParams {
  frame: Frame;
  foulPoints: number;
  gameId: number;
  playerOneId: number;
  playerTwoId: number;
}

// Hook to record a foul, award points to opponent, and switch turns.
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

      // Calculate new opponent score (foul points go to opponent)
      const opponentCurrentScore = isPlayerOne
        ? frame.playerTwoScore
        : frame.playerOneScore;
      const newOpponentScore = opponentCurrentScore + foulPoints;

      // Update frame: award points to opponent, switch turns, reset breaks
      const updates = isPlayerOne
        ? {
            playerTwoScore: newOpponentScore,
            currentPlayerTurn: opponentId,
            playerOneBreak: 0,
            playerTwoBreak: 0,
          }
        : {
            playerOneScore: newOpponentScore,
            currentPlayerTurn: opponentId,
            playerOneBreak: 0,
            playerTwoBreak: 0,
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

interface EnableFreeBallParams {
  frame: Frame;
  gameId: number;
}

// Hook to enable Free Ball mode for the next shot
export function useEnableFreeBall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ frame }: EnableFreeBallParams) => {
      if (!frame.id) {
        throw new Error("Frame ID is required");
      }

      await updateFrameScore(frame.id, {
        isFreeBall: true,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.ACTIVE_FRAME, variables.gameId],
      });
    },
  });
}

interface RecordFreeBallShotParams {
  frame: Frame;
  gameId: number;
  playerOneId: number;
}

// Hook to record a Free Ball pot (scores 1 point, treated like potting a red)
export function useRecordFreeBallShot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      frame,
      playerOneId,
    }: RecordFreeBallShotParams) => {
      if (!frame.id) {
        throw new Error("Frame ID is required");
      }

      const currentPlayerId = frame.currentPlayerTurn;
      const isPlayerOne = currentPlayerId === playerOneId;
      const points = 1; // Free Ball always scores 1 point (like a red)

      // Calculate new scores
      const currentScore = isPlayerOne
        ? frame.playerOneScore
        : frame.playerTwoScore;
      const currentBreak = isPlayerOne
        ? frame.playerOneBreak
        : frame.playerTwoBreak;

      const newScore = currentScore + points;
      const newBreak = currentBreak + points;

      // Record shot as freeball type
      await recordShot({
        frameId: frame.id,
        playerId: currentPlayerId,
        ballType: "freeball",
        points,
        isFoul: false,
      });

      // Update frame - clear Free Ball flag, update scores
      // Note: redsRemaining stays the same (the color is re-spotted)
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
        isFreeBall: false,
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

interface UndoShotParams {
  frame: Frame;
  gameId: number;
  playerOneId: number;
  playerTwoId: number;
}

// Hook to undo the last shot and recalculate frame state.
export function useUndoShot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ frame, playerOneId, playerTwoId }: UndoShotParams) => {
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
        playerOneId // Initial turn is player one
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
