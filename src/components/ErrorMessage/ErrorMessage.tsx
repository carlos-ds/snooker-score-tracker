import './ErrorMessage.css';

interface ErrorMessageProps {
  message: string;
}

function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="error-message">
      <span className="error-message__text">{message}</span>
    </div>
  );
}

export default ErrorMessage;
