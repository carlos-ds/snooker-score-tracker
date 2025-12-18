import { useState } from "react";
import { useAddPlayerMutation } from "@/hooks/usePlayerQueries";
import {
  useActiveGameQuery,
  useCreateGameMutation,
} from "@/hooks/useGameQueries";
import { usePlayersQuery } from "@/hooks/usePlayerQueries";

function AddPlayer() {
  const [step, setStep] = useState<1 | 2>(1);
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");

  const addPlayerMutation = useAddPlayerMutation();
  const createGameMutation = useCreateGameMutation();

  // Check if there's an active game
  const { data: activeGame } = useActiveGameQuery();

  // Get all players
  const { data: players = [] } = usePlayersQuery();

  // Hide form if game is active OR if 2 players already exist
  if (activeGame || players.length >= 2) {
    return null;
  }

  const handleNext = () => {
    if (player1.trim()) {
      setStep(2);
    }
  };

  const handleStartGame = async () => {
    if (!player1.trim() || !player2.trim()) {
      return;
    }

    if (player1.trim() === player2.trim()) {
      return;
    }

    try {
      // Add both players and get their IDs
      const [playerOneId, playerTwoId] = await Promise.all([
        addPlayerMutation.mutateAsync(player1.trim()),
        addPlayerMutation.mutateAsync(player2.trim()),
      ]);

      // Immediately start the game with the new players
      if (playerOneId && playerTwoId) {
        await createGameMutation.mutateAsync({
          playerOneId,
          playerTwoId,
        });
      }

      // Reset form state
      setPlayer1("");
      setPlayer2("");
      setStep(1);
    } catch (error) {
      console.error("Failed to start game:", error);
    }
  };

  const isLoading = addPlayerMutation.isPending || createGameMutation.isPending;

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
