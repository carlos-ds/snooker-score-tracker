import { useState } from "react";
import { FOUL_POINTS, BALL_DISPLAY } from "@/config/constants";
import "./FoulModal.css";

interface FoulModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFoul: (foulPoints: number, isFreeBall: boolean) => void;
}

function FoulModal({ isOpen, onClose, onSelectFoul }: FoulModalProps) {
  const [selectedBall, setSelectedBall] = useState<string | null>(null);
  const [isFreeBall, setIsFreeBall] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedBall) return;
    
    const foulPoints = FOUL_POINTS[selectedBall];
    onSelectFoul(foulPoints, isFreeBall);
    
    setSelectedBall(null);
    setIsFreeBall(false);
    onClose();
  };

  const handleClose = () => {
    setSelectedBall(null);
    setIsFreeBall(false);
    onClose();
  };

  return (
    <div className="foul-modal-overlay" onClick={handleClose}>
      <div className="foul-modal-container" onClick={(e) => e.stopPropagation()}>
        <h3>Select Ball Involved in Foul</h3>

        <div>
          {BALL_DISPLAY.map((ball) => (
            <button
              key={ball.name}
              onClick={() => setSelectedBall(ball.name)}
            >
              {ball.label} ({FOUL_POINTS[ball.name]}){selectedBall === ball.name ? " (selected)" : ""}
            </button>
          ))}
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={isFreeBall}
              onChange={(e) => setIsFreeBall(e.target.checked)}
            />
            Free ball
          </label>
        </div>

        <div>
          <button onClick={handleClose}>
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={!selectedBall}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default FoulModal;
