import type { Player } from "@/types";

import './MatchScoreHeader.css'

interface MatchScoreHeaderProps {
  bestOfFrames: number;
  playerOne: Player;
  playerTwo: Player;
  playerOneFrameWins: number;
  playerTwoFrameWins: number;
  className?: string;
  currentFrameNumber?: number;
}

function MatchScoreHeader({
  bestOfFrames,
  playerOneFrameWins,
  playerTwoFrameWins,
  currentFrameNumber,
}: MatchScoreHeaderProps) {
  return (
    <div className='match-score-header'>
      <div className="match-score-header__labels">
        <span className="match-score-header__label">
          Best of {bestOfFrames}
        </span>
        <span className="match-score-header__label">
          {playerOneFrameWins} - {playerTwoFrameWins}
        </span>
      </div>
      {currentFrameNumber !== undefined && (
        <p className="match-score-header__text">
          Frame {currentFrameNumber}
        </p>
      )}
    </div>
  );
}

export default MatchScoreHeader;
