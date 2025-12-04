import { usePlayersQuery } from "@/hooks/usePlayerQueries";
import {
  useActiveGameQuery,
  useCreateGameMutation,
  useCompleteGameMutation,
  useDeleteAllGamesMutation,
} from "@/hooks/useGameQueries";
import { useDeleteAllPlayersMutation } from "@/hooks/usePlayerQueries";

function GameControls() {
  // Get all players
  const { data: players = [] } = usePlayersQuery();

  // Check if there's an active game
  const { data: activeGame } = useActiveGameQuery();

  // Mutations
  const createGameMutation = useCreateGameMutation();
  const completeGameMutation = useCompleteGameMutation();
  const deleteAllGamesMutation = useDeleteAllGamesMutation();
  const deleteAllPlayersMutation = useDeleteAllPlayersMutation();

  // Only show "Start Game" if we have exactly 2 players and no active game
  const canStartGame = players.length === 2 && !activeGame;

  const handleStartGame = async () => {
    if (players.length !== 2) return;

    try {
      await createGameMutation.mutateAsync({
        playerOneId: players[0].id!,
        playerTwoId: players[1].id!,
      });
    } catch (error) {
      console.error("Failed to start game:", error);
    }
  };

  // End game, keep players for rematch
  const handlePlayAgain = async () => {
    try {
      await completeGameMutation.mutateAsync();
    } catch (error) {
      console.error("Failed to complete game:", error);
    }
  };

  // Full reset
  const handleResetAll = async () => {
    try {
      // Complete the game first
      await completeGameMutation.mutateAsync();
      // Then delete all data
      await Promise.all([
        deleteAllGamesMutation.mutateAsync(),
        deleteAllPlayersMutation.mutateAsync(),
      ]);
    } catch (error) {
      console.error("Failed to reset:", error);
    }
  };

  // Show different UI based on game state
  if (activeGame) {
    // Find the player names by looking up their IDs
    const playerOne = players.find((p) => p.id === activeGame.playerOneId);
    const playerTwo = players.find((p) => p.id === activeGame.playerTwoId);

    return (
      <div>
        <h2>Game in Progress</h2>
        <p>
          {playerOne?.name || "Player 1"} vs {playerTwo?.name || "Player 2"}
        </p>
        <p>Started: {activeGame.createdAt.toLocaleString()}</p>

        <div>
          <button
            onClick={handlePlayAgain}
            disabled={completeGameMutation.isPending}
          >
            {completeGameMutation.isPending
              ? "Ending..."
              : "Play Again"}
          </button>

          <button
            onClick={handleResetAll}
            disabled={
              completeGameMutation.isPending ||
              deleteAllGamesMutation.isPending ||
              deleteAllPlayersMutation.isPending
            }
          >
            New Game
          </button>
        </div>
      </div>
    );
  }

  if (players.length < 2) {
    return <p>Add 2 players to start a game.</p>;
  }

  if (canStartGame) {
    return (
      <div>
        <button
          onClick={handleStartGame}
          disabled={createGameMutation.isPending}
        >
          {createGameMutation.isPending ? "Starting..." : "Start Game"}
        </button>
      </div>
    );
  }

  return null;
}

export default GameControls;
