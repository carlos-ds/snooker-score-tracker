import ProgressIndicator from "@/components/ProgressIndicator";
import PlayerInput from "@/components/PlayerInput";
import StepControls from "@/components/StepControls";
import ErrorMessage from "@/components/ErrorMessage";

interface PlayerSetupStepProps {
  steps: string[];
  currentStep: number;
  player1: string;
  player2: string;
  onPlayer1Change: (value: string) => void;
  onPlayer2Change: (value: string) => void;
  error: string | null;
  onBack: () => void;
  onStart: () => void;
  isLoading: boolean;
}

function PlayerSetupStep({
  steps,
  currentStep,
  player1,
  player2,
  onPlayer1Change,
  onPlayer2Change,
  error,
  onBack,
  onStart,
  isLoading,
}: PlayerSetupStepProps) {
  return (
    <div className="form">
      <div className="form__header">
        <ProgressIndicator steps={steps} current={currentStep} />
        <h2 className="form__title">Enter your Names</h2>
        <p className="form__description">Enter names for both players</p>
      </div>
      
      <div className="form__body form__body--players">
        <PlayerInput
          label="Player 1"
          value={player1}
          onChange={onPlayer1Change}
          placeholder="Player 1"
          autoFocus
        />
        <span className="form__label--vs">
          VS
        </span>
        <PlayerInput
          label="Player 2"
          value={player2}
          onChange={onPlayer2Change}
          placeholder="Player 2"
          onEnter={onStart}
        />
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="form__footer">
        <StepControls
          backVisible
          onBack={onBack}
        />

        <StepControls
          startVisible
          onStart={onStart}
          startDisabled={isLoading}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default PlayerSetupStep;
