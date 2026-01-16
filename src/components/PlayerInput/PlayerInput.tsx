import './PlayerInput.css';

interface PlayerInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onEnter?: () => void;
  autoFocus?: boolean;
}

function PlayerInput({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  onEnter, 
  autoFocus = false 
}: PlayerInputProps) {
  return (
    <div className="player-input">
      <label className="player-input__label">{label}</label>
      <input
        className="player-input__input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) {
            onEnter();
          }
        }}
      />
    </div>
  );
}

export default PlayerInput;
