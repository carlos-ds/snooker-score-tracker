import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShotOperations } from "./useShotOperations";
import { useUpdateFrameScoreMutation } from "./useFrameQueries";
import { type Frame } from "@/lib/Frame";
import { type Shot } from "@/lib/Shot";
import { useFrameOperations } from "./useFrameOperations";

export const useRecordShotMutation = () => {
  const { recordShot } = useShotOperations();
  const updateFrameMutation = useUpdateFrameScoreMutation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      frame,
      ballType,
      points,
      gameId,
      playerOneId,
    }: {
      frame: Frame;
      ballType: Shot["ballType"];
      points: number;
      gameId: number;
      playerOneId: number;
    }) => {
      if (!frame.id) throw new Error("Frame ID is required");

      const currentPlayerId = frame.currentPlayerTurn;
      const isPlayerOne = currentPlayerId === playerOneId;

      // Calculate new scores
      const currentScore = isPlayerOne
        ? frame.playerOneScore
        : frame.playerTwoScore;
      const currentBreak = isPlayerOne
        ? frame.playerOneBreak
        : frame.playerTwoBreak;

      const newScore = currentScore + points;
      const newBreak = currentBreak + points;

      // Calculate new reds remaining
      const newRedsRemaining =
        ballType === "red" ? frame.redsRemaining - 1 : frame.redsRemaining;

      // Record the shot in database
      const shotData: Omit<Shot, "id"> = {
        frameId: frame.id,
        playerId: currentPlayerId,
        ballType,
        points,
        isFoul: false,
        timestamp: new Date(),
      };

      await recordShot(shotData);

      // Update frame with new scores
      const frameUpdates: Partial<Frame> = {
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
        // Turn stays with current player (they keep playing until they foul)
      };

      await updateFrameMutation.mutateAsync({
        frameId: frame.id,
        updates: frameUpdates,
        gameId,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["activeFrame", variables.gameId],
      });
    },
  });
};

export const useEndBreakMutation = () => {
  const { recordShot } = useShotOperations();
  const { updateFrameScore } = useFrameOperations();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      frame,
      playerOneId,
      playerTwoId,
    }: {
      frame: Frame;
      gameId: number;
      playerOneId: number;
      playerTwoId: number;
    }) => {
      if (!frame.id) throw new Error("Frame ID is required");

      const currentPlayerId = frame.currentPlayerTurn;
      const isPlayerOne = currentPlayerId === playerOneId;

      // Record an "end break" shot to mark the end of the current player's break and switch turns
      const endBreakShot: Omit<Shot, "id"> = {
        frameId: frame.id,
        playerId: currentPlayerId,
        ballType: "foul", // Use "foul" as the ball type marker
        points: 0,
        isFoul: false, // NOT a foul - just marks end of break
        timestamp: new Date(),
      };

      await recordShot(endBreakShot);

      // Switch to the other player
      const nextPlayerId = isPlayerOne ? playerTwoId : playerOneId;

      // Reset both players' breaks to 0 and update turn
      const frameUpdates: Partial<Frame> = {
        currentPlayerTurn: nextPlayerId,
        playerOneBreak: 0,
        playerTwoBreak: 0,
      };

      await updateFrameScore(frame.id, frameUpdates);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["activeFrame", variables.gameId],
      });
    },
  });
};

export const useUndoLastShotMutation = () => {
  const { getShotsByFrame, deleteLastShot } = useShotOperations();
  const updateFrameMutation = useUpdateFrameScoreMutation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      frame,
      gameId,
      playerOneId,
      playerTwoId,
    }: {
      frame: Frame;
      gameId: number;
      playerOneId: number;
      playerTwoId: number;
    }) => {
      if (!frame.id) throw new Error("Frame ID is required");

      // Get all shots for this frame
      const shots = await getShotsByFrame(frame.id);

      if (shots.length === 0) {
        throw new Error("No shots to undo");
      }

      // Delete the last shot
      await deleteLastShot(frame.id);

      // Recalculate frame state from remaining shots
      const remainingShots = shots.slice(0, -1);

      // Start from initial state
      let playerOneScore = 0;
      let playerTwoScore = 0;
      let playerOneBreak = 0;
      let playerTwoBreak = 0;
      let redsRemaining = 15;
      let currentPlayerTurn = frame.currentPlayerTurn; // Start with whoever started the frame

      // Replay all remaining shots
      for (const shot of remainingShots) {
        // Skip foul shots for scoring
        if (shot.ballType !== "foul") {
          // Count reds
          if (shot.ballType === "red") {
            redsRemaining--;
          }

          // Add to correct player's score
          if (shot.playerId === playerOneId) {
            playerOneScore += shot.points;
          } else {
            playerTwoScore += shot.points;
          }
        }
      }

      // Determine current turn: whoever made the last remaining shot
      // If it was a foul, turn has already switched in that foul event
      if (remainingShots.length > 0) {
        const lastRemainingShot = remainingShots[remainingShots.length - 1];

        if (lastRemainingShot.ballType === "foul") {
          // Last action was a foul, so turn switched
          // Current turn should be the OTHER player
          const foulPlayerId = lastRemainingShot.playerId;
          currentPlayerTurn =
            foulPlayerId === playerOneId ? playerTwoId : playerOneId;
        } else {
          // Last action was a regular shot, turn stays with that player
          currentPlayerTurn = lastRemainingShot.playerId;
        }
      } else {
        // No shots remaining, use the starting player for this frame
        currentPlayerTurn = playerOneId;
      }

      // Calculate breaks: count consecutive non-foul shots by the current player from the end
      for (let i = remainingShots.length - 1; i >= 0; i--) {
        const shot = remainingShots[i];

        // If we hit a foul, break calculation stops
        if (shot.ballType === "foul") {
          break;
        }

        if (shot.playerId === currentPlayerTurn) {
          if (currentPlayerTurn === playerOneId) {
            playerOneBreak += shot.points;
          } else {
            playerTwoBreak += shot.points;
          }
        } else {
          break;
        }
      }

      // Update frame with recalculated values
      const frameUpdates: Partial<Frame> = {
        playerOneScore,
        playerTwoScore,
        playerOneBreak,
        playerTwoBreak,
        redsRemaining,
        currentPlayerTurn,
      };

      await updateFrameMutation.mutateAsync({
        frameId: frame.id,
        updates: frameUpdates,
        gameId,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["activeFrame", variables.gameId],
      });
    },
  });
};
