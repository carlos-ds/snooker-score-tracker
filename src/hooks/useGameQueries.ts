import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGameOperations } from "./useGameOperations";

const ACTIVE_GAME_QUERY_KEY = ["activeGame"];
const ALL_GAMES_QUERY_KEY = ["games"];

// Hook to fetch the currently active game
// Returns undefined if no active game
export const useActiveGameQuery = () => {
  const { getActiveGame } = useGameOperations();

  return useQuery({
    queryKey: ACTIVE_GAME_QUERY_KEY,
    queryFn: async () => {
      const game = await getActiveGame();
      return game ?? null;
    },
  });
};

// Hook to create a new game
// Automatically invalidates the active game cache after success
export const useCreateGameMutation = () => {
  const { createGame } = useGameOperations();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      playerOneId,
      playerTwoId,
    }: {
      playerOneId: number;
      playerTwoId: number;
    }) => createGame(playerOneId, playerTwoId),
    // After successful creation, refresh the active game query
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACTIVE_GAME_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ALL_GAMES_QUERY_KEY });
    },
  });
};

// Hook to complete the active game
// Marks it as "completed" in the database
export const useCompleteGameMutation = () => {
  const { completeActiveGame } = useGameOperations();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeActiveGame,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACTIVE_GAME_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ALL_GAMES_QUERY_KEY });
    },
  });
};

// Hook to delete all games
// Full reset
export const useDeleteAllGamesMutation = () => {
  const { deleteAllGames } = useGameOperations();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAllGames,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACTIVE_GAME_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ALL_GAMES_QUERY_KEY });
    },
  });
};
