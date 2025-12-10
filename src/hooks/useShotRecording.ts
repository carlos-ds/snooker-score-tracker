import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShotOperations } from "./useShotOperations";
import { useUpdateFrameScoreMutation } from "./useFrameQueries";
import { type Frame } from "@/lib/Frame";
import { type Shot } from "@/lib/Shot";

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
      playerTwoId,
    }: {
      frame: Frame;
      ballType: Shot["ballType"];
      points: number;
      gameId: number;
      playerOneId: number;
      playerTwoId: number;
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

export const useEndTurnMutation = () => {
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

      const currentPlayerId = frame.currentPlayerTurn;
      const isPlayerOne = currentPlayerId === playerOneId;

      // Switch to the other player
      const nextPlayerId = isPlayerOne ? playerTwoId : playerOneId;

      // Reset both players' breaks to 0 (break ends when turn ends)
      const frameUpdates: Partial<Frame> = {
        currentPlayerTurn: nextPlayerId,
        playerOneBreak: 0,
        playerTwoBreak: 0,
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