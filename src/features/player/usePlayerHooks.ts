import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/config/constants";
import { getAllPlayers, createPlayer, deleteAllPlayers } from "./operations";
import type { CreatePlayerInput } from "@/types";

// ===== Query Hooks =====

// Hook to fetch all players
export function usePlayers() {
  return useQuery({
    queryKey: QUERY_KEYS.PLAYERS,
    queryFn: getAllPlayers,
  })
}

// ===== Mutation Hooks =====

// Hook to create a new player
export function useCreatePlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePlayerInput) => createPlayer(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PLAYERS });
    },
  });
}

// Hook to delete all players
export function useDeleteAllPlayers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAllPlayers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PLAYERS });
    },
  });
}