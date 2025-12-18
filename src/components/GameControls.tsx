import { usePlayersQuery } from "@/hooks/usePlayerQueries";
import {
  useActiveGameQuery,
  useResetGameDataMutation,
  useCreateGameMutation,
} from "@/hooks/useGameQueries";
import { useDeleteAllPlayersMutation } from "@/hooks/usePlayerQueries";

function GameControls() {
  // Get all players
  const { data: players = [] } = usePlayersQuery();

  // Check if there's an active game
  const { data: activeGame } = useActiveGameQuery();

  // Mutations
  const resetGameDataMutation = useResetGameDataMutation();
  const createGameMutation = useCreateGameMutation();
  const deleteAllPlayersMutation = useDeleteAllPlayersMutation();

  // Play Again: Clear games, frames, shots but keep players, then start new game
  const handlePlayAgain = async () => {
    if (!activeGame) return;

    try {
      // Reset all game data first
      await resetGameDataMutation.mutateAsync();

      // Immediately start a new game with the same players
      await createGameMutation.mutateAsync({
        playerOneId: activeGame.playerOneId,
        playerTwoId: activeGame.playerTwoId,
      });
    } catch (error) {
      console.error("Failed to start new game:", error);
    }
  };

  // New Game: Clear everything including players
  const handleNewGame = async () => {
    try {
      await Promise.all([
        resetGameDataMutation.mutateAsync(),
        deleteAllPlayersMutation.mutateAsync(),
      ]);
    } catch (error) {
      console.error("Failed to reset all:", error);
    }
  };

  // Show different UI based on game state
  if (activeGame) {
    // Find the player names by looking up their IDs
    const playerOne = players.find((p) => p.id === activeGame.playerOneId);
    const playerTwo = players.find((p) => p.id === activeGame.playerTwoId);

    return (
      <>
        <h2>Game in Progress</h2>
        <p>
          {playerOne?.name || "Player 1"} vs {playerTwo?.name || "Player 2"}
        </p>
        <p>Started: {activeGame.createdAt.toLocaleString()}</p>

        <div>
          <button
            onClick={handlePlayAgain}
            disabled={
              resetGameDataMutation.isPending || createGameMutation.isPending
            }
          >
            {resetGameDataMutation.isPending || createGameMutation.isPending
              ? "Starting..."
              : "Play Again"}
          </button>

          <button
            onClick={handleNewGame}
            disabled={
              resetGameDataMutation.isPending ||
              deleteAllPlayersMutation.isPending
            }
          >
            New Game
          </button>
        </div>
      </>
    );
  }

  return null;
}

export default GameControls;
