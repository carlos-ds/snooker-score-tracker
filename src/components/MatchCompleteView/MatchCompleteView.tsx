import type { Player } from "@/types";
import MatchScoreHeader from "@/components/MatchScoreHeader";

interface MatchCompleteViewProps {
  bestOfFrames: number;
  playerOne: Player;
  playerTwo: Player;
  playerOneFrameWins: number;
  playerTwoFrameWins: number;
}

function MatchCompleteView({
  bestOfFrames,
  playerOne,
  playerTwo,
  playerOneFrameWins,
  playerTwoFrameWins,
}: MatchCompleteViewProps) {
  const matchWinner = playerOneFrameWins > playerTwoFrameWins ? playerOne : playerTwo;

  return (
    <div>
      <h1>Match Complete!</h1>
      <MatchScoreHeader
        bestOfFrames={bestOfFrames}
        playerOne={playerOne}
        playerTwo={playerTwo}
        playerOneFrameWins={playerOneFrameWins}
        playerTwoFrameWins={playerTwoFrameWins}
      />
      <p>
        <strong>{matchWinner.name}</strong> wins the match!
      </p>
    </div>
  );
}

export default MatchCompleteView;
