import { usePlayersQuery } from "@/hooks/usePlayerQueries";
import {
  useActiveGameQuery,
  useCreateGameMutation,
  useResetGameDataMutation,
} from "@/hooks/useGameQueries";
import { useDeleteAllPlayersMutation } from "@/hooks/usePlayerQueries";

function GameControls() {
  // Get all players
  const { data: players = [] } = usePlayersQuery();

  // Check if there's an active game
  const { data: activeGame } = useActiveGameQuery();

  // Mutations
  const createGameMutation = useCreateGameMutation();
  const resetGameDataMutation = useResetGameDataMutation();
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

  // Play Again: Clear games, frames, shots but keep players
  const handlePlayAgain = async () => {
    try {
      await resetGameDataMutation.mutateAsync();
    } catch (error) {
      console.error("Failed to reset game data:", error);
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
      <div>
        <h2>Game in Progress</h2>
        <p>
          {playerOne?.name || "Player 1"} vs {playerTwo?.name || "Player 2"}
        </p>
        <p>Started: {activeGame.createdAt.toLocaleString()}</p>

        <div>
          <button
            onClick={handlePlayAgain}
            disabled={resetGameDataMutation.isPending}
          >
            {resetGameDataMutation.isPending ? "Resetting..." : "Play Again"}
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
