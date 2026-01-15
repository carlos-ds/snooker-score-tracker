import { useState } from "react";
import { usePlayers, useCreatePlayer } from "@/features/player/usePlayerHooks";
import { useActiveGame, useCreateGame } from "@/features/game/useGameHooks";

function AddPlayer() {
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");

  const { data: players = [] } = usePlayers();
  const { data: activeGame } = useActiveGame();
  const createPlayerMutation = useCreatePlayer();
  const createGameMutation = useCreateGame();

  if (activeGame || players.length >= 2) {
    return null;
  }

  const handleStartGame = async () => {
    const trimmedPlayer1 = player1.trim();
    const trimmedPlayer2 = player2.trim();

    if (!trimmedPlayer1 || !trimmedPlayer2) {
      return;
    }

    if (trimmedPlayer1 === trimmedPlayer2) {
      return;
    }

    try {
      const [playerOneId, playerTwoId] = await Promise.all([
        createPlayerMutation.mutateAsync({ name: trimmedPlayer1 }),
        createPlayerMutation.mutateAsync({ name: trimmedPlayer2 }),
      ]);

      if (playerOneId && playerTwoId) {
        await createGameMutation.mutateAsync({
          playerOneId,
          playerTwoId,
        });
      }

      setPlayer1("");
      setPlayer2("");
    } catch (error) {
      console.error("Failed to start game:", error);
    }
  };

  const isLoading =
    createPlayerMutation.isPending || createGameMutation.isPending;

  const hasDuplicateNames =
    player1.trim() && player2.trim() && player1.trim() === player2.trim();

  const canStartGame =
    player1.trim() && player2.trim() && !isLoading && !hasDuplicateNames;

  return (
    <div>
      <h2>Start a New Game</h2>
      {hasDuplicateNames ? (
        <p style={{ color: "red" }}>Player names must be unique</p>
      ) : (
        <p>Enter the names of both players</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input
          type="text"
          value={player1}
          onChange={(e) => setPlayer1(e.target.value)}
          placeholder="Player 1"
          autoFocus
        />
        <input
          type="text"
          value={player2}
          onChange={(e) => setPlayer2(e.target.value)}
          placeholder="Player 2"
          onKeyDown={(e) => e.key === "Enter" && canStartGame && handleStartGame()}
        />
        <button
          onClick={handleStartGame}
          disabled={!canStartGame}
        >
          {isLoading ? "Starting..." : "Start Game"}
        </button>
      </div>
    </div>
  );
}

export default AddPlayer;
