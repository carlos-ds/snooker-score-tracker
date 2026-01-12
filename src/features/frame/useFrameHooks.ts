import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/config/constants";
import {
  getActiveFrame,
  getFramesByGame,
  createFrame,
  updateFrameScore,
  completeFrame,
} from "./operations";
import type { CreateFrameInput, FrameScoreUpdate } from "@/types";

// ===== Query Hooks =====

// Hook to fetch the active frame for a specific game
export function useActiveFrame(gameId: number | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ACTIVE_FRAME, gameId],
    queryFn: async () => {
      if (!gameId) return null;
      const frame = await getActiveFrame(gameId);
      return frame ?? null;
    },
    enabled: !!gameId,
  });
}

// Hook to fetch all frames for a specific game
export function useGameFrames(gameId: number | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.GAME_FRAMES, gameId],
    queryFn: async () => {
      if (!gameId) return [];
      return await getFramesByGame(gameId);
    },
    enabled: !!gameId,
  });
}

// ===== Mutation Hooks =====

// Hook to create a new frame
export function useCreateFrame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFrameInput) => createFrame(input),
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

// Hook to update frame score and state
export function useUpdateFrameScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      frameId,
      updates,
    }: {
      frameId: number;
      updates: FrameScoreUpdate;
      gameId: number;
    }) => updateFrameScore(frameId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.ACTIVE_FRAME, variables.gameId],
      });
    },
  });
}

// Hook to complete a frame with winner
export function useCompleteFrame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      frameId,
      winnerId,
    }: {
      frameId: number;
      winnerId: number;
      gameId: number;
    }) => completeFrame(frameId, winnerId),
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
