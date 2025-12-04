import { useState } from "react";
import { useAddPlayerMutation } from "@/hooks/usePlayerQueries";

function AddPlayer() {
  const [step, setStep] = useState<1 | 2>(1);
  const [status, setStatus] = useState("Add players:");
  const [playerOneName, setPlayerOneName] = useState("");
  const [playerTwoName, setPlayerTwoName] = useState("");

  const addPlayerMutation = useAddPlayerMutation();

  const handleNext = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (playerOneName.trim() === "") {
      setStatus("Please enter player one name.");
      return;
    }

    setStatus("Enter player two name:");
    setStep(2);
  };

  const handleAddPlayers = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (playerTwoName.trim() === "") {
      setStatus("Please enter player two name.");
      return;
    }

    if (playerOneName === playerTwoName) {
      setStatus("Player names must be unique.");
      return;
    }

    try {
      await Promise.all([
        addPlayerMutation.mutateAsync(playerOneName),
        addPlayerMutation.mutateAsync(playerTwoName),
      ]);

      setStatus("Players added successfully.");
      setPlayerOneName("");
      setPlayerTwoName("");
      setStep(1);
    } catch (error) {
      setStatus(
        `Failed to add players: ${
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
        <form onSubmit={handleAddPlayers}>
          <input
            autoFocus
            placeholder="Player 2"
            value={playerTwoName}
            onChange={(e) => setPlayerTwoName(e.target.value)}
          />
          <button type="button" onClick={() => setStep(1)}>
            Back
          </button>
          <button type="submit">Save Players</button>
        </form>
      )}
    </div>
  );
}

export default AddPlayer;
