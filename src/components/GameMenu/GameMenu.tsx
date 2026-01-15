import { useState } from "react";
import {
  usePlayers,
  useDeleteAllPlayers,
} from "@/features/player/usePlayerHooks";
import {
  useActiveGame,
  useResetGameData,
  useCreateGame,
} from "@/features/game/useGameHooks";
import "./GameMenu.css";

function GameMenu() {
  const [isOpen, setIsOpen] = useState(false);

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
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to start new game:", error);
    }
  };

  const handleEndGame = async () => {
    try {
      await Promise.all([
        resetGameDataMutation.mutateAsync(),
        deleteAllPlayersMutation.mutateAsync(),
      ]);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to reset all:", error);
    }
  };

  if (!activeGame) return null;

  const playerOne = players.find((p) => p.id === activeGame.playerOneId);
  const playerTwo = players.find((p) => p.id === activeGame.playerTwoId);

  const isStarting =
    resetGameDataMutation.isPending || createGameMutation.isPending;
  const isEnding =
    resetGameDataMutation.isPending || deleteAllPlayersMutation.isPending;

  return (
    <div className="game-menu">
      <button onClick={() => setIsOpen(!isOpen)}>
        ⋮
      </button>

      {isOpen && (
        <div className="game-menu__dropdown">
          <h3>Game in Progress</h3>
          <p>
            {playerOne?.name || "Player 1"} vs {playerTwo?.name || "Player 2"}
          </p>
          <p>Started: {activeGame.createdAt.toLocaleString()}</p>

          <div>
            <button onClick={handlePlayAgain} disabled={isStarting}>
              {isStarting ? "Starting..." : "Play Again"}
            </button>

            <button onClick={handleEndGame} disabled={isEnding}>
              End Game
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <div 
          className="game-menu__backdrop"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default GameMenu;
