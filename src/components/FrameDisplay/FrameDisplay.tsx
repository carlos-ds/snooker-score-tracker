import type { Frame, Player } from "@/types";
import ShotButtons from "@/components/ShotButtons/ShotButtons";

interface FrameDisplayProps {
  frame: Frame;
  playerOne: Player;
  playerTwo: Player;
  gameId: number;
  onStartNextFrame?: () => void;
}

function FrameDisplay({
  frame,
  playerOne,
  playerTwo,
  gameId,
  onStartNextFrame,
}: FrameDisplayProps) {
  const isPlayerOneTurn = frame.currentPlayerTurn === playerOne.id;
  const isFrameComplete = frame.status === "completed";
  
  // Determine winner name
  const winner = frame.winnerId === playerOne.id ? playerOne : playerTwo;

  // Show frame complete UI
  if (isFrameComplete) {
    return (
      <div>
        <h2>Frame {frame.frameNumber} Complete.</h2>
        
        <div>
          <div>
            <h3>{playerOne.name}</h3>
            <p>{frame.playerOneScore}</p>
            {frame.winnerId === playerOne.id && <p>Winner!</p>}
          </div>

          <div>
            <h3>{playerTwo.name}</h3>
            <p>{frame.playerTwoScore}</p>
            {frame.winnerId === playerTwo.id && <p>Winner!</p>}
          </div>
        </div>

        <div>
          <p><strong>{winner.name}</strong> wins the frame!</p>
        </div>

        {onStartNextFrame && (
          <div>
            <button onClick={onStartNextFrame}>
              Next Frame
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2>Frame {frame.frameNumber}</h2>

      <div>
        <div>
          <h3>{playerOne.name}</h3>
          <p>{frame.playerOneScore}</p>
          <p>Break: {frame.playerOneBreak}</p>
          {isPlayerOneTurn && <p>•</p>}
        </div>

        <div>
          <h3>{playerTwo.name}</h3>
          <p>{frame.playerTwoScore}</p>
          <p>Break: {frame.playerTwoBreak}</p>
          {!isPlayerOneTurn && <p>•</p>}
        </div>
      </div>

      <ShotButtons
        frame={frame}
        gameId={gameId}
        playerOneId={playerOne.id!}
        playerTwoId={playerTwo.id!}
      />
    </div>
  );
}

export default FrameDisplay;

