import { useState } from "react";
import { FOUL_POINTS, BALL_DISPLAY } from "@/config/constants";
import "./FoulModal.css";

interface FoulModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFoul: (foulPoints: number, isFreeBall: boolean, isMiss: boolean) => void;
}

function FoulModal({ isOpen, onClose, onSelectFoul }: FoulModalProps) {
  const [selectedBall, setSelectedBall] = useState<string | null>(null);
  const [isFreeBall, setIsFreeBall] = useState(false);
  const [isMiss, setIsMiss] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedBall) return;
    
    const foulPoints = FOUL_POINTS[selectedBall];
    onSelectFoul(foulPoints, isFreeBall, isMiss);
    
    setSelectedBall(null);
    setIsFreeBall(false);
    setIsMiss(false);
    onClose();
  };

  const handleClose = () => {
    setSelectedBall(null);
    setIsFreeBall(false);
    setIsMiss(false);
    onClose();
  };

  return (
    <div className="foul-modal" onClick={handleClose}>
      <div className="foul-modal__ball-buttons" onClick={(e) => e.stopPropagation()}>
        <h3 className="foul-modal__title">Select Ball Involved in Foul</h3>
        <div className="foul-modal__buttons-container">
          {BALL_DISPLAY.map((ball) => (
            <button
              className={`foul-modal__ball-button foul-modal__ball-button--${ball.label} ${selectedBall === ball.name ? 'foul-modal__ball-button--selected' : ''}`}
              key={ball.name}
              onClick={() => setSelectedBall(ball.name)}
            >
              {FOUL_POINTS[ball.name]}
            </button>
          ))}
        </div>
      </div>

      <div className="foul-modal__options" onClick={(e) => e.stopPropagation()}>
        <label>
          <input
            type="checkbox"
            checked={isFreeBall}
            onChange={(e) => setIsFreeBall(e.target.checked)}
          />
            Free ball
        </label>
      
        <label>
          <input
            type="checkbox"
            checked={isMiss}
            onChange={(e) => setIsMiss(e.target.checked)}
          />
            Miss
        </label>
      </div>

      <div className="foul-modal__actions" onClick={(e) => e.stopPropagation()}>
        <button onClick={handleClose}>
          Cancel
        </button>
        <button onClick={handleConfirm} disabled={!selectedBall}>
          Confirm
        </button>
      </div>
    </div>
  );
}

export default FoulModal;

