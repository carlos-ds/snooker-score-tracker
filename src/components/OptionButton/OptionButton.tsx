import Balls from "../Balls/Balls";

interface OptionButtonProps {
  label: string;
  value: number | string;
  selected: boolean;
  onClick: () => void;
  icon?: string;
  balls?: number;
  secondaryLabel?: string;
}

function OptionButton({ label, selected, onClick, icon, balls, secondaryLabel }: OptionButtonProps) {
  return (
    <button className={`option${selected ? " option--selected" : ""}`} onClick={onClick}>
      {secondaryLabel &&
        <span className="option__secondary-label">{secondaryLabel}</span>
      }
      <span className="option__label">{ icon || label }</span>
      {balls &&
        <Balls amount={balls} />
      }
    </button>
  );
}

export default OptionButton;
