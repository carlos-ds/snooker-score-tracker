import {
  useDeleteAllPlayers,
} from "@/features/player/usePlayerHooks";
import {
  useActiveGame,
  useResetGameData,
  useCreateGame,
} from "@/features/game/useGameHooks";
import { useNavigate } from "@tanstack/react-router";

function GameControls() {
  const navigate = useNavigate();
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
        redsCount: activeGame.redsCount ?? 15,
        bestOfFrames: activeGame.bestOfFrames ?? 1,
      });
    } catch (error) {
      console.error("Failed to start new game:", error);
    }
  };

  const handleNewGame = async () => {
    try {
      await Promise.all([
        resetGameDataMutation.mutateAsync(),
        deleteAllPlayersMutation.mutateAsync(),
      ]);
      navigate({ to: "/" });
    } catch (error) {
      console.error("Failed to reset all:", error);
    }
  };

  if (!activeGame || activeGame.status !== "completed") {
    return null;
  }

  const isStarting =
    resetGameDataMutation.isPending || createGameMutation.isPending;
  const isEnding =
    resetGameDataMutation.isPending || deleteAllPlayersMutation.isPending;

  return (
    <div>
      <button onClick={handlePlayAgain} disabled={isStarting}>
        {isStarting ? "Starting..." : "Play Again"}
      </button>

      <button onClick={handleNewGame} disabled={isEnding}>
        {isEnding ? "Ending..." : "New Game"}
      </button>
    </div>
  );
}

export default GameControls;

