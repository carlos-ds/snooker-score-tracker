import { useState } from "react";
import { FOUL_BALLS } from "@/config/constants";
import "@/components/ShotButtons/ShotButtons.css";
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
    <div className="foul-modal__backdrop" onClick={handleBackdropClick}>
      <div className="foul-modal__content">
        <h2>Foul</h2>
        <p>Select the ball involved</p>

        <div className="shot-buttons__balls">
          {FOUL_BALLS.map((item) => (
            <button
              key={item.ball}
              className="shot-button"
              onClick={() => handleSelectBall(item.points)}
              disabled={isPending}
            >
              <span>{item.ball}</span>
              <span>+{item.points}</span>
            </button>
          ))}
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={isFreeBall}
              onChange={(e) => setIsFreeBall(e.target.checked)}
              disabled={isPending}
            />
            Free Ball
          </label>
        </div>

        <button onClick={onClose} disabled={isPending}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default FoulModal;
