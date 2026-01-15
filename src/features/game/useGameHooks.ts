import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/config/constants";
import {
  getActiveGame,
  createGame,
  completeActiveGame,
  deleteAllGames,
} from "./operations";
import { createFrame } from "@/features/frame/operations";
import { deleteAllFrames } from "@/features/frame/operations";
import { deleteAllShots } from "@/features/shot/operations";
import type { CreateGameInput } from "@/types";

// ===== Query Hooks =====

// Hook to fetch the active game
// Returns null if no active game exists
export function useActiveGame() {
  return useQuery({
    queryKey: QUERY_KEYS.ACTIVE_GAME,
    queryFn: async () => {
      const game = await getActiveGame();
      return game ?? null;
    },
  });
}

// ===== Mutation Hooks =====

// Hook to create a new game along with its first frame
export function useCreateGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateGameInput) => {
      const gameId = await createGame(input);

      // Immediately create Frame 1 with player one starting
      await createFrame({
        gameId,
        frameNumber: 1,
        startingPlayerId: input.playerOneId,
        redsCount: input.redsCount,
      });

      return gameId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVE_GAME });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GAMES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVE_FRAME });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GAME_FRAMES });
    },
  });
}

// Hook to complete the active game
export function useCompleteGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeActiveGame,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVE_GAME });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GAMES });
    },
  });
}

// Hook to reset all game data while keeping players.
export function useResetGameData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await Promise.all([
        deleteAllGames(),
        deleteAllFrames(),
        deleteAllShots(),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVE_GAME });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GAMES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVE_FRAME });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GAME_FRAMES });
    },
  });
}
