import { type Frame } from "@/lib/Frame";
import { type Player } from "@/lib/Player";
import ShotButtons from "./ShotButtons";

interface FrameDisplayProps {
  frame: Frame;
  playerOne: Player;
  playerTwo: Player;
  gameId: number;
}

function FrameDisplay({
  frame,
  playerOne,
  playerTwo,
  gameId,
}: FrameDisplayProps) {
  // Determine which player's turn it is
  const isPlayerOneTurn = frame.currentPlayerTurn === playerOne.id;

  return (
    <div>
      <h2>Frame {frame.frameNumber}</h2>

      {/* Score Display */}
      <div>
        <div>
          <h3>{playerOne.name}</h3>
          <p>
            {frame.playerOneScore}
          </p>
          <p>Break: {frame.playerOneBreak}</p>
          {isPlayerOneTurn && <p>•</p>}
        </div>

        <div>
          <h3>{playerTwo.name}</h3>
          <p>
            {frame.playerTwoScore}
          </p>
          <p>Break: {frame.playerTwoBreak}</p>
          {!isPlayerOneTurn && <p>•</p>}
        </div>
      </div>

      {/* Shot Buttons */}
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
