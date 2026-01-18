import { useState, useEffect } from "react";
import { useCreatePlayer } from "@/features/player/usePlayerHooks";
import { useActiveGame, useCreateGame } from "@/features/game/useGameHooks";
import { useNavigate } from "@tanstack/react-router";
import { SNOOKER_RULES } from "@/config/constants";

type SetupStep = "reds" | "frames" | "players";

interface GameSetupData {
  redsCount: number;
  bestOfFrames: number;
  player1: string;
  player2: string;
}

function GameSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState<SetupStep>("reds");
  const [data, setData] = useState<GameSetupData>({
    redsCount: SNOOKER_RULES.INITIAL_REDS,
    bestOfFrames: 1,
    player1: "",
    player2: "",
  });
  const [showCustomFramesInput, setShowCustomFramesInput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: activeGame } = useActiveGame();
  const createPlayerMutation = useCreatePlayer();
  const createGameMutation = useCreateGame();

  // Auto-redirect to game if one is active
  useEffect(() => {
    if (activeGame && activeGame.status === "active") {
      navigate({ to: "/game" });
    }
  }, [activeGame, navigate]);

  const handleNext = () => {
    setError(null);
    switch (step) {
      case "reds":
        setStep("frames");
        break;
      case "frames":
        if (data.bestOfFrames % 2 === 0) {
          setError("Number of frames must be odd (e.g. 1, 3, 5, 7)");
          return;
        }
        setStep("players");
        break;
      case "players":
        handleStartGame();
        break;
    }
  };

  const handleBack = () => {
    setError(null);
    switch (step) {
      case "frames":
        setStep("reds");
        break;
      case "players":
        setStep("frames");
        break;
    }
  };

  const handleStartGame = async () => {
    const trimmedPlayer1 = data.player1.trim();
    const trimmedPlayer2 = data.player2.trim();

    if (!trimmedPlayer1 || !trimmedPlayer2) {
      setError("Both player names are required");
      return;
    }
    if (trimmedPlayer1 === trimmedPlayer2) {
      setError("Player names must be different");
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
          redsCount: data.redsCount,
          bestOfFrames: data.bestOfFrames,
        });
        navigate({ to: "/game" });
      }
    } catch (error) {
      console.error("Failed to start game:", error);
    }
  };

  const isLoading =
    createPlayerMutation.isPending || createGameMutation.isPending;

  return (
    <div>
      {/* Progress Indicator */}
      <div>
        <div>1</div>
        <div></div>
        <div>2</div>
        <div></div>
        <div>3</div>
      </div>

      <div>
        {step === "reds" && (
          <div>
            <h2>Initial Reds</h2>
            <p>Select the number of red balls to start with.</p>
            <div>
              {[6, 10, 15].map((count) => (
                <button
                  key={count}
                  onClick={() => setData({ ...data, redsCount: count })}
                >
                  <span>{count}</span>
                  <span>Reds {data.redsCount === count ? "(Selected)" : ""}</span>
                </button>
              ))}
            </div>
            <div>
              <button onClick={handleNext}>Next</button>
            </div>
          </div>
        )}

        {step === "frames" && (
          <div>
            <h2>Match Length</h2>
            <p>Best of how many frames?</p>
            <div>
              {[1, 3, 5].map((count) => (
                <button
                  key={count}
                  onClick={() => setData({ ...data, bestOfFrames: count })}
                >
                  <span>{count}</span>
                  <span>{count === 1 ? "Frame" : "Frames"} {data.bestOfFrames === count ? "(Selected)" : ""}</span>
                </button>
              ))}
               <button
                  onClick={() => setShowCustomFramesInput(!showCustomFramesInput)}
                >
                  <span>?</span>
                  <span>Custom {showCustomFramesInput ? "(Editing)" : (![1, 3, 5].includes(data.bestOfFrames) ? "(Selected)" : "")}</span>
                </button>
            </div>
            
            {showCustomFramesInput && (
              <div>
                <label>Enter number of frames:</label>
                <input 
                  type="number"
                  min="1"
                  step="2"
                  value={data.bestOfFrames || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setData({ ...data, bestOfFrames: val === "" ? 0 : parseInt(val) });
                  }}
                />
              </div>
            )}
            
            {error && (
              <div>
                {error}
              </div>
            )}

            <div>
              <button onClick={handleBack}>Back</button>
              <button onClick={handleNext}>Next</button>
            </div>
          </div>
        )}

        {step === "players" && (
          <div>
            <h2>Players</h2>
            <p>Enter names for both players</p>
            
            <div style={{ marginBottom: '1rem' }}>
              <label>Player 1 Name</label>
              <input
                type="text"
                value={data.player1}
                onChange={(e) => setData({ ...data, player1: e.target.value })}
                placeholder="Player 1"
                autoFocus
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
               <label>Player 2 Name</label>
               <input
                type="text"
                value={data.player2}
                onChange={(e) => setData({ ...data, player2: e.target.value })}
                placeholder="Player 2"
                onKeyDown={(e) => e.key === "Enter" && handleStartGame()}
              />
            </div>

            {error && (
              <div style={{ color: 'red', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <div>
              <button onClick={handleBack}>Back</button>
              <button 
                onClick={handleStartGame} 
                disabled={!data.player1.trim() || !data.player2.trim() || isLoading}
              >
                {isLoading ? "Starting..." : "Start Game"}
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default GameSetup;
