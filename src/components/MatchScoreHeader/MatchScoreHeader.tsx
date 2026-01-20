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
  currentFrameNumber,
}: MatchScoreHeaderProps) {
  return (
    <div className='match-score-header'>
      <p className="match-score-header__label">
        Best of {bestOfFrames}
      </p>
      {currentFrameNumber !== undefined && (
        <p className="match-score-header__title">
          Your current Frame <span className="match-score-header__title--accent"> {currentFrameNumber}</span>
        </p>
      )}
    </div>
    
  );
}

export default MatchScoreHeader;
