import ProgressIndicator from "@/components/ProgressIndicator";
import SelectionGroup from "@/components/SelectionGroup";
import StepControls from "@/components/StepControls";

interface RedSelectionStepProps {
  steps: string[];
  currentStep: number;
  redsCount: number;
  onRedsChange: (value: number) => void;
  onNext: () => void;
  onBack: () => void;
}

function RedSelectionStep({
  steps,
  currentStep,
  redsCount,
  onRedsChange,
  onNext,
  onBack,
}: RedSelectionStepProps) {
  return (
    <div className="form">
      <div className="form__header">
        <ProgressIndicator steps={steps} current={currentStep} />
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
          value={redsCount}
          onChange={(value) => onRedsChange(value as number)}
        />
      </div>

      <div className="form__footer">
        <StepControls
          nextDisabled
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

export default RedSelectionStep;
