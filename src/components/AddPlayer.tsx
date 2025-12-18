import { useState } from "react";
import { useAddPlayerMutation } from "@/hooks/usePlayerQueries";
import {
  useActiveGameQuery,
  useCreateGameMutation,
} from "@/hooks/useGameQueries";
import { usePlayersQuery } from "@/hooks/usePlayerQueries";

function AddPlayer() {
  const [step, setStep] = useState<1 | 2>(1);
  const [status, setStatus] = useState("Add players:");
  const [playerOneName, setPlayerOneName] = useState("");
  const [playerTwoName, setPlayerTwoName] = useState("");

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

  const handleNext = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (playerOneName.trim() === "") {
      setStatus("Please enter a name for player one.");
      return;
    }

    setStatus("Enter a name for player two:");
    setStep(2);
  };

  const handleStartGame = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (playerTwoName.trim() === "") {
      setStatus("Please enter a name for player two.");
      return;
    }

    if (playerOneName === playerTwoName) {
      setStatus("Player names must be unique.");
      return;
    }

    try {
      // Add both players and get their IDs
      const [playerOneId, playerTwoId] = await Promise.all([
        addPlayerMutation.mutateAsync(playerOneName),
        addPlayerMutation.mutateAsync(playerTwoName),
      ]);

      // Immediately start the game with the new players
      if (playerOneId && playerTwoId) {
        await createGameMutation.mutateAsync({
          playerOneId,
          playerTwoId,
        });
      }

      // Reset form state
      setPlayerOneName("");
      setPlayerTwoName("");
      setStep(1);
    } catch (error) {
      setStatus(
        `Failed to start game: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  return (
    <div>
      <p>{status}</p>

      {step === 1 && (
        <form onSubmit={handleNext}>
          <input
            autoFocus
            placeholder="Player 1"
            value={playerOneName}
            onChange={(e) => setPlayerOneName(e.target.value)}
          />
          <button type="submit">Next</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleStartGame}>
          <input
            autoFocus
            placeholder="Player 2"
            value={playerTwoName}
            onChange={(e) => setPlayerTwoName(e.target.value)}
          />
          <button type="button" onClick={() => setStep(1)}>
            Back
          </button>
          <button
            type="submit"
            disabled={
              addPlayerMutation.isPending || createGameMutation.isPending
            }
          >
            {addPlayerMutation.isPending || createGameMutation.isPending
              ? "Starting..."
              : "Start Game"}
          </button>
        </form>
      )}
    </div>
  );
}

export default AddPlayer;
