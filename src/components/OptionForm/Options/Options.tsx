import './Options.css';

type OptionsProps = {
  val: string;
  children: React.ReactNode;
  defaultChecked?: boolean;
}

function Options({val, children, defaultChecked}: OptionsProps) {
  return (
    <label htmlFor={val} className="option">
      {children}
      <input type="radio" name="option" value={val} className="option__input" defaultChecked={defaultChecked} />
    </label>
  )
}

export default Options;