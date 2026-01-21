import './ProgressIndicator.css';

type ProgressIndicatorProps = {
  steps: string[];
  current: number;
}

function ProgressIndicator({ steps, current }: ProgressIndicatorProps) {
  return (
    <div className="progress-indicator">
      Step {current} of {steps.length}
    </div>
  );
}

export default ProgressIndicator;
