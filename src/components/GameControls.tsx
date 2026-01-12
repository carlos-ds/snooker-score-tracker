import { useNavigate } from "@tanstack/react-router";
import {
  usePlayers,
  useDeleteAllPlayers,
} from "@/features/player/usePlayerHooks";
import {
  useActiveGame,
  useResetGameData,
  useCreateGame,
} from "@/features/game/useGameHooks";

function GameControls() {
  const navigate = useNavigate();
  const { data: players = [] } = usePlayers();
  const { data: activeGame } = useActiveGame();

  const resetGameDataMutation = useResetGameData();
  const createGameMutation = useCreateGame();
  const deleteAllPlayersMutation = useDeleteAllPlayers();

  const handlePlayAgain = async () => {
    if (!activeGame) return;

    try {
      await resetGameDataMutation.mutateAsync();

      await createGameMutation.mutateAsync({
        playerOneId: activeGame.playerOneId,
        playerTwoId: activeGame.playerTwoId,
      });
    } catch (error) {
      console.error("Failed to start new game:", error);
    }
  };

  // Handler to completely end the game and reset all data
  // Executes cleanup sequentially to prevent race conditions and data corruption
  const handleEndGame = async () => {
    try {
      // Step 1: Reset game-related data (games, frames, shots)
      // Must happen first to maintain referential integrity
      await resetGameDataMutation.mutateAsync();
      
      // Step 2: Delete all players from database
      // Only after game data is cleared to avoid orphaned games
      await deleteAllPlayersMutation.mutateAsync();
      
      // Step 3: Navigate user back to home page after successful cleanup
      navigate({ to: "/" });
    } catch (error) {
      console.error("Failed to end game:", error);
    }
  };

  if (activeGame) {
    const playerOne = players.find((p) => p.id === activeGame.playerOneId);
    const playerTwo = players.find((p) => p.id === activeGame.playerTwoId);

    const isStarting =
      resetGameDataMutation.isPending || createGameMutation.isPending;
    const isEnding =
      resetGameDataMutation.isPending || deleteAllPlayersMutation.isPending;

    return (
      <>
        <h2>Game in Progress</h2>
        <p>
          {playerOne?.name || "Player 1"} vs {playerTwo?.name || "Player 2"}
        </p>
        <p>Started: {activeGame.createdAt.toLocaleString()}</p>

        <div>
          <button onClick={handlePlayAgain} disabled={isStarting}>
            {isStarting ? "Starting..." : "Play Again"}
          </button>

          <button onClick={handleEndGame} disabled={isEnding}>
            {isEnding ? "Ending..." : "End Game"}
          </button>
        </div>
      </>
    );
  }

  return null;
}

export default GameControls;
