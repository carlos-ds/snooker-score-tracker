import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFrameOperations } from "./useFrameOperations";
import { type Frame } from "@/lib/Frame";

// Queries is for data on the client side

const ACTIVE_FRAME_QUERY_KEY = ["activeFrame"];
const GAME_FRAMES_QUERY_KEY = ["gameFrames"];

// Hook to fetch the active frame for a game
export const useActiveFrameQuery = (gameId: number | undefined) => {
  const { getActiveFrame } = useFrameOperations();

  return useQuery({
    queryKey: [...ACTIVE_FRAME_QUERY_KEY, gameId],
    queryFn: async () => {
      if (!gameId) return null;
      const frame = await getActiveFrame(gameId);
      return frame ?? null;
    },
    enabled: !!gameId, // Only run if gameId exists
  });
};

// Hook to fetch all frames for a game
export const useGameFramesQuery = (gameId: number | undefined) => {
  const { getFramesByGame } = useFrameOperations();

  return useQuery({
    queryKey: [...GAME_FRAMES_QUERY_KEY, gameId],
    queryFn: async () => {
      if (!gameId) return [];
      return await getFramesByGame(gameId);
    },
    enabled: !!gameId,
  });
};

// Hook to create a new frame
export const useCreateFrameMutation = () => {
  const { createFrame } = useFrameOperations();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      gameId,
      frameNumber,
      startingPlayerId,
    }: {
      gameId: number;
      frameNumber: number;
      startingPlayerId: number;
    }) => createFrame(gameId, frameNumber, startingPlayerId),
    onSuccess: (_, variables) => {
      // Refresh active frame query for this specific game
      queryClient.invalidateQueries({
        queryKey: [...ACTIVE_FRAME_QUERY_KEY, variables.gameId],
      });
      queryClient.invalidateQueries({
        queryKey: [...GAME_FRAMES_QUERY_KEY, variables.gameId],
      });
    },
  });
};

// Hook to update frame scores
export const useUpdateFrameScoreMutation = () => {
  const { updateFrameScore } = useFrameOperations();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      frameId,
      updates,
      gameId,
    }: {
      frameId: number;
      updates: Partial<Frame>;
      gameId: number;
    }) => updateFrameScore(frameId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...ACTIVE_FRAME_QUERY_KEY, variables.gameId],
      });
    },
  });
};

// Hook to complete a frame
export const useCompleteFrameMutation = () => {
  const { completeFrame } = useFrameOperations();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      frameId,
      winnerId,
      gameId,
    }: {
      frameId: number;
      winnerId: number;
      gameId: number;
    }) => completeFrame(frameId, winnerId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...ACTIVE_FRAME_QUERY_KEY, variables.gameId],
      });
      queryClient.invalidateQueries({
        queryKey: [...GAME_FRAMES_QUERY_KEY, variables.gameId],
      });
    },
  });
};
