import { FOUL_BALLS } from "@/config/constants";
import "./FoulModal.css";

interface FoulModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFoulPoints: (points: number) => void;
  isPending: boolean;
}

function FoulModal({
  isOpen,
  onClose,
  onSelectFoulPoints,
  isPending,
}: FoulModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="foul-modal-backdrop" onClick={handleBackdropClick}>
      <div className="foul-modal">
        <div className="foul-modal__header">
          <h2 className="foul-modal__title">Foul</h2>
          <p className="foul-modal__subtitle">Select the ball involved</p>
        </div>

        <div className="foul-modal__balls">
          {FOUL_BALLS.map((item) => (
            <button
              key={item.ball}
              className={`foul-modal__ball ${item.ball}`}
              onClick={() => onSelectFoulPoints(item.points)}
              disabled={isPending}
            >
              <span className="foul-modal__ball-points">+{item.points}</span>
            </button>
          ))}
        </div>

        <button
          className="foul-modal__cancel"
          onClick={onClose}
          disabled={isPending}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default FoulModal;
