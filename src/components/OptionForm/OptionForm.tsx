import './OptionForm.css';

type OptionFormProps = {
  formName: string;
  children?: React.ReactNode;
  className?: string;
}

function OptionForm({formName, children, className}: OptionFormProps) {

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const optionValue = formData.get("option");

    localStorage.setItem(formName, optionValue as string);
  }

  return (
    <form className={className} name={formName} onSubmit={onSubmit}>
      {children}
    </form>
  )
}

export default OptionForm;