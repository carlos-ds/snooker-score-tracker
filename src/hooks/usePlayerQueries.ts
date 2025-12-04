import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePlayerOperations } from "./usePlayerOperations";

const PLAYERS_QUERY_KEY = ["players"];

// Hook to fetch players using React Query
export const usePlayersQuery = () => {
  const { getAllPlayers } = usePlayerOperations();

  return useQuery({
    queryKey: PLAYERS_QUERY_KEY,
    queryFn: getAllPlayers,
  });
};

// Hook to add a new player using React Query mutation
export const useAddPlayerMutation = () => {
  const { addPlayer } = usePlayerOperations();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addPlayer,
    // After successful add, refresh the players list
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLAYERS_QUERY_KEY });
    },
  });
};
