import { usePlayersQuery } from "@/hooks/usePlayerQueries";
import {
  useActiveGameQuery,
  useCreateGameMutation,
} from "@/hooks/useGameQueries";

function GameControls() {
  // Get all players
  const { data: players = [] } = usePlayersQuery();

  // Check if there's an active game
  const { data: activeGame } = useActiveGameQuery();

  // Mutation to create a game
  const createGameMutation = useCreateGameMutation();

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
