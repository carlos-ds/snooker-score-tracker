import {
  useDeleteAllPlayers,
} from "@/features/player/usePlayerHooks";
import {
  useActiveGame,
  useResetGameData,
  useCreateGame,
} from "@/features/game/useGameHooks";
import { useActiveFrame } from "@/features/frame/useFrameHooks";
import { useResignFrame } from "@/features/shot/useShotHooks";
import { useNavigate } from "@tanstack/react-router";
import OverflowMenu from "@/components/OverflowMenu";

function GameControls() {
  const navigate = useNavigate();
  const { data: activeGame } = useActiveGame();
  const { data: activeFrame } = useActiveFrame(activeGame?.id);

  const resetGameDataMutation = useResetGameData();
  const createGameMutation = useCreateGame();
  const deleteAllPlayersMutation = useDeleteAllPlayers();
  const resignFrameMutation = useResignFrame();

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

  const handleResign = async () => {
    if (!activeGame || !activeFrame?.id) return;

    try {
      await resignFrameMutation.mutateAsync({
        frame: activeFrame,
        gameId: activeGame.id!,
        playerOneId: activeGame.playerOneId,
        playerTwoId: activeGame.playerTwoId,
      });
    } catch (error) {
      console.error("Failed to resign frame:", error);
    }
  };

  if (!activeGame) {
    return null;
  }

  const isStarting =
    resetGameDataMutation.isPending || createGameMutation.isPending;
  const isEnding =
    resetGameDataMutation.isPending || deleteAllPlayersMutation.isPending;

  return (
    <OverflowMenu>
      <button onClick={handlePlayAgain} disabled={isStarting}>
        {isStarting ? "Starting..." : "Play Again"}
      </button>

      <button onClick={handleNewGame} disabled={isEnding}>
        {isEnding ? "Ending..." : "New Game"}
      </button>

      <button onClick={handleResign} disabled={resignFrameMutation.isPending || !activeFrame}>
        {resignFrameMutation.isPending ? "Resigning..." : "Resign Frame"}
      </button>
    </OverflowMenu>
  );
}

export default GameControls;
