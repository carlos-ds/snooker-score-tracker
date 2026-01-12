import type { Frame, Player } from "@/types";
import ShotButtons from "./ShotButtons";
import "./FrameDisplay.css";

interface FrameDisplayProps {
  frame: Frame;
  playerOne: Player;
  playerTwo: Player;
  gameId: number;
  onFrameComplete?: (winnerId: number) => void;
}

function FrameDisplay({
  frame,
  playerOne,
  playerTwo,
  gameId,
  onFrameComplete,
}: FrameDisplayProps) {
  const isPlayerOneTurn = frame.currentPlayerTurn === playerOne.id;

  return (
    <div className="frame-display">
      <h2 className="frame-display__title">Frame {frame.frameNumber}</h2>

      <div className="frame-display__players">
        <div className={`frame-display__player ${isPlayerOneTurn ? 'active' : ''}`}>
          <h3>{playerOne.name}</h3>
          <div>
            <p className="frame-display__score-label">Score</p>
            <p className="frame-display__score-value">{frame.playerOneScore}</p>
          </div>
          <div>
            <p className="frame-display__score-label">Break</p>
            <p className="frame-display__break-value">{frame.playerOneBreak}</p>
          </div>
          <div>
            <p className="frame-display__score-label">Highest Break</p>
            <p className="frame-display__break-value">{playerOne.highestBreak}</p>
          </div>
          {isPlayerOneTurn && <p className="turn-indicator">●</p>}
        </div>

        <div className={`frame-display__player ${!isPlayerOneTurn ? 'active' : ''}`}>
          <h3>{playerTwo.name}</h3>
          <div>
            <p className="frame-display__score-label">Score</p>
            <p className="frame-display__score-value">{frame.playerTwoScore}</p>
          </div>
          <div>
            <p className="frame-display__score-label">Break</p>
            <p className="frame-display__break-value">{frame.playerTwoBreak}</p>
          </div>
          <div>
            <p className="frame-display__score-label">Highest Break</p>
            <p className="frame-display__break-value">{playerTwo.highestBreak}</p>
          </div>
          {!isPlayerOneTurn && <p className="turn-indicator">●</p>}
        </div>
      </div>

      <ShotButtons
        frame={frame}
        gameId={gameId}
        playerOneId={playerOne.id!}
        playerTwoId={playerTwo.id!}
        onFrameComplete={onFrameComplete}
      />
    </div>
  );
}

export default FrameDisplay;
