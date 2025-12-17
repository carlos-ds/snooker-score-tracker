import { useRef } from "react";
import './Options.css';

type OptionsProps = {
  val: string;
  children: React.ReactNode;
  defaultChecked?: boolean;
  className?: string;
  hasInput?: boolean;
};

function Options({ val, children, defaultChecked, className, hasInput }: OptionsProps) {

  const radioRef = useRef<HTMLInputElement>(null);

  return (
    <label className={`option ${className || ""}`}>
      {children}

      <input
        ref={radioRef}
        type="radio"
        name="option"
        value={val}
        className="option__input"
        defaultChecked={defaultChecked}
      />

      {hasInput && (
        <input
          type="number"
          min="1"
          max="21"
          className="option__number-input"
          onChange={(e) => {
            if (radioRef.current) {
              radioRef.current.value = e.target.value;
              radioRef.current.checked = true;
            }
          }}
        />
      )}
    </label>
  );
}

export default Options;
