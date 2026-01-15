import { FOUL_POINTS, BALL_DISPLAY } from "@/config/constants";
import "./FoulModal.css";

interface FoulModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFoul: (foulPoints: number) => void;
}

function FoulModal({ isOpen, onClose, onSelectFoul }: FoulModalProps) {
  if (!isOpen) return null;

  const handleFoulSelect = (ballName: string) => {
    const foulPoints = FOUL_POINTS[ballName];
    onSelectFoul(foulPoints);
    onClose();
  };

  return (
    <div className="foul-modal-overlay" onClick={onClose}>
      <div className="foul-modal-container" onClick={(e) => e.stopPropagation()}>
        <h3>Select Ball Involved in Foul</h3>

        <div>
          {BALL_DISPLAY.map((ball) => (
            <button
              key={ball.name}
              onClick={() => handleFoulSelect(ball.name)}
            >
              {ball.label} ({FOUL_POINTS[ball.name]})
            </button>
          ))}
        </div>

        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export default FoulModal;
