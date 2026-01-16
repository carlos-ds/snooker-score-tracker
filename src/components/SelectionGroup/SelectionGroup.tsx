import OptionButton from "@/components/OptionButton";

interface Option {
  label: string;
  value: number | string;
  icon?: string;
  secondaryLabel?: string;
  className?: string;
  balls?: number;
}

interface SelectionGroupProps {
  options: Option[];
  value: number | string;
  onChange: (value: number | string) => void;
  className?: string;
  children?: React.ReactNode;
}

function SelectionGroup({ options, value, onChange, className, children }: SelectionGroupProps) {
  return (
    <div className={`selection-group ${className}`}>
      {options.map((option) => (
        <OptionButton 
          key={option.value}
          label={option.label}
          value={option.value}
          selected={value === option.value}
          onClick={() => onChange(option.value)}
          icon={option.icon}
          secondaryLabel={option.secondaryLabel}
          balls={option.balls}
        />
      ))}
      {children}
    </div>
  );
}

export default SelectionGroup;
