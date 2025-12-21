import { useState } from "react";
import { usePlayers, useCreatePlayer } from "@/features/player/usePlayerHooks";
import { useActiveGame, useCreateGame } from "@/features/game/useGameHooks";

function AddPlayer() {
  const [step, setStep] = useState<1 | 2>(1);
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");

  const { data: players = [] } = usePlayers();
  const { data: activeGame } = useActiveGame();
  const createPlayerMutation = useCreatePlayer();
  const createGameMutation = useCreateGame();

  if (activeGame || players.length >= 2) {
    return null;
  }

  const handleNext = () => {
    if (player1.trim()) {
      setStep(2);
    }
  };

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
      setStep(1);
    } catch (error) {
      console.error("Failed to start game:", error);
    }
  };

  const isLoading =
    createPlayerMutation.isPending || createGameMutation.isPending;

  return (
    <div>
      <h2>{step === 1 ? "Player 1" : "Player 2"}</h2>
      <p>
        {step === 1
          ? "Enter the first player's name"
          : "Enter the second player's name"}
      </p>

      {step === 1 ? (
        <div>
          <input
            type="text"
            value={player1}
            onChange={(e) => setPlayer1(e.target.value)}
            placeholder="Enter name..."
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleNext()}
          />
          <button onClick={handleNext} disabled={!player1.trim()}>
            Next
          </button>
        </div>
      ) : (
        <div>
          <p>{player1} vs...</p>
          <input
            type="text"
            value={player2}
            onChange={(e) => setPlayer2(e.target.value)}
            placeholder="Enter name..."
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleStartGame()}
          />
          <button onClick={() => setStep(1)} disabled={isLoading}>
            Back
          </button>
          <button
            onClick={handleStartGame}
            disabled={!player2.trim() || isLoading}
          >
            {isLoading ? "Starting..." : "Start Game"}
          </button>
        </div>
      )}
    </div>
  );
}

export default AddPlayer;
