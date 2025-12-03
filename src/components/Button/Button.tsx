type ButtonProps = { 
  label: string;
  value: string;
  onClick?: () => void;
}

function Button({ onClick, label, value }: ButtonProps) {
  return (
    <button onClick={onClick} value={value}>
      {label}
    </button>
  );
}

export default Button;