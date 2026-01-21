import { useState, useEffect } from "react";
import { useCreatePlayer } from "@/features/player/usePlayerHooks";
import { useActiveGame, useCreateGame } from "@/features/game/useGameHooks";
import { useNavigate } from "@tanstack/react-router";
import { SNOOKER_RULES } from "@/config/constants";
import ProgressIndicator from "@/components/ProgressIndicator";
import SelectionGroup from "@/components/SelectionGroup";
import CustomNumberInput from "@/components/CustomNumberInput";
import StepControls from "@/components/StepControls";
import PlayerInput from "@/components/PlayerInput";
import ErrorMessage from "@/components/ErrorMessage";

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

  const steps = ["reds", "frames", "players"];
  const getCurrentStepIndex = () => steps.indexOf(step) + 1;

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
      console.log("[GameSetup] Creating players...");
      const [playerOneId, playerTwoId] = await Promise.all([
        createPlayerMutation.mutateAsync({ name: trimmedPlayer1 }),
        createPlayerMutation.mutateAsync({ name: trimmedPlayer2 }),
      ]);
      console.log("[GameSetup] Players created:", playerOneId, playerTwoId);

      if (playerOneId && playerTwoId) {
        console.log("[GameSetup] Creating game...");
        await createGameMutation.mutateAsync({
          playerOneId,
          playerTwoId,
          redsCount: data.redsCount,
          bestOfFrames: data.bestOfFrames,
        });
        console.log("[GameSetup] Game created, navigating to /game...");
        navigate({ to: "/game" });
      }
    } catch (error) {
      console.error("[GameSetup] Failed to start game:", error);
      setError("Failed to start game. Please try again.");
    }
  };

  const isLoading =
    createPlayerMutation.isPending || createGameMutation.isPending;

  return (
    <div>
      <div>
        {step === "reds" && (
          <div className="form">
            <div className="form__header">
              <ProgressIndicator steps={steps} current={getCurrentStepIndex()} />
              <div className="">
                <h2 className="form__title">Select your Reds</h2>
                <p className="form__description">Select the number of red balls to start with.</p>
              </div>
            </div>

            <div className="form__body">
              <SelectionGroup
                className="selection-group--reds"
                options={[
                  { label: "6", value: 6, balls: 6 },
                  { label: "10", value: 10, balls: 10 },
                  { label: "15", value: 15, balls: 15 },
                ]}
                value={data.redsCount}
                onChange={(value) => setData({ ...data, redsCount: value as number })}
              />
            </div>

            <div className="form__footer">
              <StepControls
                nextDisabled
                backVisible
                onBack={handleBack}
              />

              <StepControls
                nextVisible
                onNext={handleNext}
              />
            </div>
          </div>
        )}

        {step === "frames" && (
          <div className="form">
            <div className="form__header">
              <ProgressIndicator steps={steps} current={getCurrentStepIndex()} />
              <h2 className="form__title">Select your Frames</h2>
              <p className="form__description">Select the number of frames to play.</p>
            </div>

            <div className="form__body">
              <SelectionGroup
                className="selection-group--frames"
                options={[
                  { label: "1", value: 1, secondaryLabel: "Best of" },
                  { label: "3", value: 3, secondaryLabel: "Best of" },
                  { label: "5", value: 5, secondaryLabel: "Best of" },
                  { label: "7", value: 7, secondaryLabel: "Best of" },
                ]}
                value={data.bestOfFrames}
                onChange={(value) => setData({ ...data, bestOfFrames: value as number })}
              >
                <CustomNumberInput
                  value={data.bestOfFrames}
                  onChange={(value) => setData({ ...data, bestOfFrames: value })}
                  min={1}
                  step={2}
                  editing={showCustomFramesInput}
                  onToggle={() => setShowCustomFramesInput(!showCustomFramesInput)}
                  standardValues={[1, 3, 5, 7]}
                />
              </SelectionGroup>
            </div>

            {error && <ErrorMessage message={error} />}

            <div className="form__footer">
              <StepControls
                backVisible
                onBack={handleBack}
              />

              <StepControls
                nextVisible
                onNext={handleNext}
              />
            </div>
          </div>
        )}

        {step === "players" && (
          <div className="form">
            <div className="form__header">
              <ProgressIndicator steps={steps} current={getCurrentStepIndex()} />
              <h2 className="form__title">Enter your Names</h2>
              <p className="form__description">Enter names for both players</p>
            </div>
            
            <div className="form__body form__body--players">
              <PlayerInput
                label="Player 1"
                value={data.player1}
                onChange={(value) => setData({ ...data, player1: value })}
                placeholder="Player 1"
                autoFocus
              />
              <span className="form__label--vs">
                VS
              </span>
              <PlayerInput
                label="Player 2"
                value={data.player2}
                onChange={(value) => setData({ ...data, player2: value })}
                placeholder="Player 2"
                onEnter={handleStartGame}
              />
            </div>

            {error && <ErrorMessage message={error} />}

            <div className="form__footer">
              <StepControls
                backVisible
                onBack={handleBack}
              />

              <StepControls
                startVisible
                onStart={handleStartGame}
                startDisabled={isLoading}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameSetup;
