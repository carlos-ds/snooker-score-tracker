import { useState, useEffect } from "react";
import { FOUL_POINTS, BALL_DISPLAY, BALL_COLORS_ORDER } from "@/config/constants";
import "./FoulModal.css";

interface FoulModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFoul: (foulPoints: number, isFreeBall: boolean, isMiss: boolean, foulBallName?: string) => void;
  redsRemaining: number;
  isStrictOrderPhase: boolean;
  strictOrderIndex: number;
  isRespottedBlackPhase: boolean;
}

function FoulModal({ 
  isOpen, 
  onClose, 
  onSelectFoul,
  redsRemaining,
  isStrictOrderPhase,
  strictOrderIndex,
  isRespottedBlackPhase,
}: FoulModalProps) {
  const [selectedBall, setSelectedBall] = useState<string | null>(null);
  const [isFreeBall, setIsFreeBall] = useState(false);
  const [isMiss, setIsMiss] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Reset selection when modal opens/closes or game state changes
  useEffect(() => {
    if (!isOpen) {
      setSelectedBall(null);
    }
  }, [isOpen, isStrictOrderPhase, strictOrderIndex]);

  if (!isOpen) return null;

  // Determines if a ball is still on the table and can be fouled.
  // During strict order phase (yellow → green → brown → blue → pink → black),
  // balls that have been potted are removed from the table.
  const isBallOnTable = (ballName: string): boolean => {
    // White ball is always on the table
    if (ballName === "white") return true;

    // During respotted black phase, only black and white are on the table
    if (isRespottedBlackPhase) {
      return ballName === "black";
    }

    // During reds phase, all balls are on the table
    if (redsRemaining > 0) return true;

    // Not in strict order phase yet (e.g., last red color choice), all colors available
    if (!isStrictOrderPhase) return true;

    // Red is off the table once we're in strict order phase
    if (ballName === "red") return false;

    // In strict order phase: check if the ball has been potted
    // strictOrderIndex indicates how many colors have been potted in order
    // BALL_COLORS_ORDER = ["yellow", "green", "brown", "blue", "pink", "black"]
    const ballIndexInOrder = BALL_COLORS_ORDER.indexOf(ballName as typeof BALL_COLORS_ORDER[number]);
    
    if (ballIndexInOrder === -1) return false;

    // Ball is on table if its index >= strictOrderIndex (i.e., not yet potted)
    return ballIndexInOrder >= strictOrderIndex;
  };

  const handleBallClick = (ballName: string) => {
    if (!isBallOnTable(ballName)) {
      // Ball is not on table, don't allow selection
      return;
    }
    setSelectedBall(ballName);
  };

  const handleConfirm = () => {
    if (!selectedBall) return;
    
    if (!isBallOnTable(selectedBall)) {
      setSelectedBall(null);
      return;
    }
    
    const foulPoints = FOUL_POINTS[selectedBall];
    onSelectFoul(foulPoints, isFreeBall, isMiss, selectedBall);
    
    setSelectedBall(null);
    setIsFreeBall(false);
    setIsMiss(false);
    onClose();
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedBall(null);
      setIsFreeBall(false);
      setIsMiss(false);
      setIsClosing(false);
      onClose();
    }, 150);
  };

  return (
    <div className={`foul-modal-overlay ${isClosing ? "foul-modal-overlay--closing" : ""}`} onClick={handleClose}>
      <div className="foul-modal" onClick={(e) => e.stopPropagation()}>
      <div className="foul-modal__ball-buttons" onClick={(e) => e.stopPropagation()}>
        <h3 className="foul-modal__title">Select Ball Involved in Foul</h3>
        <div className="foul-modal__buttons-container">
          {BALL_DISPLAY.map((ball) => {
            const isOnTable = isBallOnTable(ball.name);
            const isSelected = selectedBall === ball.name;
            
            return (
              <button
                className={`foul-modal__ball-button foul-modal__ball-button--${ball.label} ${isSelected ? 'foul-modal__ball-button--selected' : ''} ${!isOnTable ? 'foul-modal__ball-button--disabled' : ''}`}
                key={ball.name}
                onClick={() => handleBallClick(ball.name)}
                disabled={!isOnTable}
                title={!isOnTable ? "Ball already potted" : undefined}
              >
                {FOUL_POINTS[ball.name]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="foul-modal__options" onClick={(e) => e.stopPropagation()}>
        <label>
          <input
            type="checkbox"
            checked={isFreeBall}
            onChange={(e) => {
              setIsFreeBall(e.target.checked);
              if (e.target.checked) setIsMiss(false);
            }}
          />
            Free ball
        </label>
      
        <label>
          <input
            type="checkbox"
            checked={isMiss}
            onChange={(e) => {
              setIsMiss(e.target.checked);
              if (e.target.checked) setIsFreeBall(false);
            }}
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
    </div>
  );
}

export default FoulModal;

