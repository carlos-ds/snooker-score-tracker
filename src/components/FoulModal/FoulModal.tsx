import { useState } from "react";
import { FOUL_BALLS } from "@/config/constants";
import "./FoulModal.css";

interface FoulModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFoul: (points: number, isFreeBall: boolean) => void;
  isPending: boolean;
}

function FoulModal({
  isOpen,
  onClose,
  onSelectFoul,
  isPending,
}: FoulModalProps) {
  const [isFreeBall, setIsFreeBall] = useState(false);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSelectBall = (points: number) => {
    onSelectFoul(points, isFreeBall);
    setIsFreeBall(false);
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
              onClick={() => handleSelectBall(item.points)}
              disabled={isPending}
            >
              <span className="foul-modal__ball-points">+{item.points}</span>
            </button>
          ))}
        </div>

        <label className="foul-modal__freeball">
          <input
            type="checkbox"
            checked={isFreeBall}
            onChange={(e) => setIsFreeBall(e.target.checked)}
            disabled={isPending}
          />
          <span>Free Ball</span>
        </label>

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
