import './Options.css';
import { useRef } from "react";

type OptionsProps = {
  val: string;
  children: React.ReactNode;
  defaultChecked?: boolean;
  className?: string;
  hasInput?: boolean;
  formName?: string;
};

function Options({ val, children, defaultChecked, className, hasInput, formName }: OptionsProps) {

  const radioRef = useRef<HTMLInputElement>(null);

  // Check localStorage for previously selected option
  const getShouldBeChecked = () => {
    if (formName) {
      const storedValue = localStorage.getItem(formName);
      if (storedValue) {
        return storedValue === val;
      }
    }
    return defaultChecked || false;
  };

  return (
    <label className={`option ${className || ""}`}>
      {children}

      <input
        ref={radioRef}
        type="radio"
        name="option"
        value={val}
        className="option__input"
        defaultChecked={getShouldBeChecked()}
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
