import ProgressIndicator from "@/components/ProgressIndicator";
import SelectionGroup from "@/components/SelectionGroup";
import CustomNumberInput from "@/components/CustomNumberInput";
import StepControls from "@/components/StepControls";
import ErrorMessage from "@/components/ErrorMessage";

interface FrameSelectionStepProps {
  steps: string[];
  currentStep: number;
  bestOfFrames: number;
  onFramesChange: (value: number) => void;
  showCustomInput: boolean;
  onToggleCustomInput: () => void;
  error: string | null;
  onNext: () => void;
  onBack: () => void;
}

function FrameSelectionStep({
  steps,
  currentStep,
  bestOfFrames,
  onFramesChange,
  showCustomInput,
  onToggleCustomInput,
  error,
  onNext,
  onBack,
}: FrameSelectionStepProps) {
  return (
    <div className="form">
      <div className="form__header">
        <ProgressIndicator steps={steps} current={currentStep} />
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
          value={bestOfFrames}
          onChange={(value) => onFramesChange(value as number)}
        >
          <CustomNumberInput
            value={bestOfFrames}
            onChange={onFramesChange}
            min={1}
            step={2}
            editing={showCustomInput}
            onToggle={onToggleCustomInput}
            standardValues={[1, 3, 5, 7]}
          />
        </SelectionGroup>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="form__footer">
        <StepControls
          backVisible
          onBack={onBack}
        />

        <StepControls
          nextVisible
          onNext={onNext}
        />
      </div>
    </div>
  );
}

export default FrameSelectionStep;
