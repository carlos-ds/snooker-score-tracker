import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGameOperations } from "./useGameOperations";
import { useFrameOperations } from "./useFrameOperations";

// Queries is for data on the client side

const ACTIVE_GAME_QUERY_KEY = ["activeGame"];
const ALL_GAMES_QUERY_KEY = ["games"];
const ACTIVE_FRAME_QUERY_KEY = ["activeFrame"];
const GAME_FRAMES_QUERY_KEY = ["gameFrames"];

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

// Hook to create a new game and its first frame
// Automatically invalidates the active game cache after success
export const useCreateGameMutation = () => {
  const { createGame } = useGameOperations();
  const { createFrame } = useFrameOperations();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      playerOneId,
      playerTwoId,
    }: {
      playerOneId: number;
      playerTwoId: number;
    }) => {
      // Create the game first
      const gameId = await createGame(playerOneId, playerTwoId);

      // Immediately create Frame 1 with player one starting
      if (gameId) {
        await createFrame(gameId, 1, playerOneId);
      }

      return gameId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACTIVE_GAME_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ALL_GAMES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ACTIVE_FRAME_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: GAME_FRAMES_QUERY_KEY }); 
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
