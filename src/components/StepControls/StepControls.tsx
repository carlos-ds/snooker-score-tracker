import './StepControls.css';

interface StepControlsProps {
  onBack?: () => void;
  onNext?: () => void;
  onStart?: () => void;
  backVisible?: boolean;
  nextVisible?: boolean;
  startVisible?: boolean;
  nextDisabled?: boolean;
  startDisabled?: boolean;
  isLoading?: boolean;
}

function StepControls({ 
  onBack, 
  onNext, 
  onStart,
  backVisible = false,
  nextVisible = false,
  startVisible = false,
  nextDisabled = false,
  startDisabled = false,
  isLoading = false
}: StepControlsProps) {
  return (
    <>
      {backVisible && (
        <button className="step-button step-button--secondary" onClick={onBack} disabled={nextDisabled}>Back</button>
      )}
      {nextVisible && (
        <button className="step-button" onClick={onNext} disabled={nextDisabled}>Next</button>
      )}
      {startVisible && (
        <button className="step-button" onClick={onStart} disabled={startDisabled || isLoading}>
          {isLoading ? "Starting..." : "Start Game"}
        </button>
      )}
    </>
  );
}

export default StepControls;
