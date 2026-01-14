import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  useActiveGame,
  useResetGameData,
  useCreateGame,
} from "@/features/game/useGameHooks";
import { useDeleteAllPlayers } from "@/features/player/usePlayerHooks";
import "./GameMenu.css";

function GameMenu() {
  const navigate = useNavigate();
  const { data: activeGame } = useActiveGame();
  const [isOpen, setIsOpen] = useState(false);

  const resetGameDataMutation = useResetGameData();
  const createGameMutation = useCreateGame();
  const deleteAllPlayersMutation = useDeleteAllPlayers();

  const isPending =
    resetGameDataMutation.isPending ||
    createGameMutation.isPending ||
    deleteAllPlayersMutation.isPending;

  const handlePlayAgain = async () => {
    if (!activeGame) return;

    try {
      await resetGameDataMutation.mutateAsync();
      await createGameMutation.mutateAsync({
        playerOneId: activeGame.playerOneId,
        playerTwoId: activeGame.playerTwoId,
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to restart game:", error);
    }
  };

  const handleNewGame = async () => {
    try {
      await resetGameDataMutation.mutateAsync();
      await deleteAllPlayersMutation.mutateAsync();
      navigate({ to: "/" });
    } catch (error) {
      console.error("Failed to start new game:", error);
    }
  };

  const handleBackdropClick = () => {
    if (!isPending) {
      setIsOpen(false);
    }
  };

  return (
    <div className="game-menu">
      <button
        className="game-menu__trigger"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        aria-label="Game menu"
      >
        ⋮
      </button>

      {isOpen && (
        <>
          <div className="game-menu__backdrop" onClick={handleBackdropClick} />
          <div className="game-menu__dropdown">
            <button
              className="game-menu__item"
              onClick={handlePlayAgain}
              disabled={isPending}
            >
              {resetGameDataMutation.isPending || createGameMutation.isPending
                ? "Restarting..."
                : "Play Again"}
            </button>
            <button
              className="game-menu__item"
              onClick={handleNewGame}
              disabled={isPending}
            >
              {deleteAllPlayersMutation.isPending ? "Ending..." : "New Game"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default GameMenu;
