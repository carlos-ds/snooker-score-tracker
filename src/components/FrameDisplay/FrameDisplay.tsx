import type { Frame, Player } from "@/types";
import ShotButtons from "@/components/ShotButtons";

interface FrameDisplayProps {
  frame: Frame;
  playerOne: Player;
  playerTwo: Player;
  gameId: number;
  redsCount: number;
}

function calculateRemainingPoints(redsRemaining: number): number {
  const redsWithBlackPoints = redsRemaining * 8;  
  const finalColorsPoints = 27;
  
  return redsWithBlackPoints + finalColorsPoints;
}

function FrameDisplay({
  frame,
  playerOne,
  playerTwo,
  gameId,
  redsCount,
}: FrameDisplayProps) {
  const isPlayerOneTurn = frame.currentPlayerTurn === playerOne.id;
  
  const remainingPoints = calculateRemainingPoints(frame.redsRemaining);
  const pointDifference = Math.abs(frame.playerOneScore - frame.playerTwoScore);
  const leader = frame.playerOneScore > frame.playerTwoScore 
    ? playerOne.name 
    : frame.playerTwoScore > frame.playerOneScore 
      ? playerTwo.name 
      : null;

  return (
    <div>
      <h2>Frame {frame.frameNumber}</h2>

      <div>
        <p>Remaining: {remainingPoints}</p>
        <p>{leader ? `${leader} leads by ${pointDifference}` : 'Tied'}</p>
      </div>

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
        initialRedsCount={redsCount}
      />
    </div>
  );
}

export default FrameDisplay;
