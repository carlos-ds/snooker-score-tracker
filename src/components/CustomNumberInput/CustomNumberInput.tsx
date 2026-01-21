import './CustomNumberInput.css';

interface CustomNumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
  editing: boolean;
  onToggle: () => void;
  standardValues?: number[];
  className?: string;
}

function CustomNumberInput({ 
  value, 
  onChange, 
  min = 1, 
  step = 2, 
  editing, 
  onToggle,
  standardValues = [],
  className = ""
}: CustomNumberInputProps) {
  const isCustomValue = !standardValues.includes(value);
  
  return (
    <div className={`${className} custom-number-input${editing ? " custom-number-input--editing" : (isCustomValue ? " custom-number-input--selected" : "")}`}>
      <button className="custom-number-input__toggle" onClick={onToggle}>
        <span>Custom</span>
      </button>
      
      {editing && (
        <div className="custom-number-input__input-group">
          <input 
            className="custom-number-input__input"
            type="number"
            min={min}
            step={step}
            value={value || ""}
            onChange={(e) => {
              const val = e.target.value;
              onChange(val === "" ? 0 : parseInt(val));
            }}
          />
        </div>
      )}
    </div>
  );
}

export default CustomNumberInput;
