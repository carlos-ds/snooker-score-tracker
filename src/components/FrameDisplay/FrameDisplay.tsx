import { useEffect, useState, useRef } from "react";
import type { Frame, Player, Shot } from "@/types";
import ShotButtons from "@/components/ShotButtons";
import { getShotsByFrame } from "@/features/shot/operations";

import './FrameDisplay.css'

interface FrameDisplayProps {
  frame: Frame;
  playerOne: Player;
  playerTwo: Player;
  gameId: number;
  redsCount: number;
  playerOneFrameWins: number;
  playerTwoFrameWins: number;
}

const STRICT_ORDER_POINTS = [2, 3, 4, 5, 6, 7];

function calculateRemainingPoints(redsRemaining: number, strictOrderIndex: number): number {
  if (redsRemaining > 0) {
    const redsWithBlackPoints = redsRemaining * 8;
    const finalColorsPoints = 27;
    return redsWithBlackPoints + finalColorsPoints;
  } else {
    return STRICT_ORDER_POINTS.slice(strictOrderIndex).reduce((sum, pts) => sum + pts, 0);
  }
}

function FrameDisplay({
  frame,
  playerOne,
  playerTwo,
  gameId,
  redsCount,
  playerOneFrameWins,
  playerTwoFrameWins,
}: FrameDisplayProps) {
  const isPlayerOneTurn = frame.currentPlayerTurn === playerOne.id;
  const [strictOrderIndex, setStrictOrderIndex] = useState(0);
  const [breakSequence, setBreakSequence] = useState<{ shots: Shot[], ownerId: number }>({ shots: [], ownerId: -1 });
  const breakSequenceRef1 = useRef<HTMLDivElement>(null);
  const breakSequenceRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (breakSequenceRef1.current) {
      breakSequenceRef1.current.scrollTo({ left: breakSequenceRef1.current.scrollWidth, behavior: 'smooth' });
    }
    if (breakSequenceRef2.current) {
      breakSequenceRef2.current.scrollTo({ left: breakSequenceRef2.current.scrollWidth, behavior: 'smooth' });
    }
  }, [breakSequence]);

  useEffect(() => {
    const calculateStats = async () => {
      if (!frame.id) return;

      const shots = await getShotsByFrame(frame.id);
      
      // Calculate Strict Order Index
      if (frame.redsRemaining > 0) {
        setStrictOrderIndex(0);
      } else {
        let strictOrderColorsPotted = 0;
        let currentRedsCount = redsCount;
        let lastRedPotterId: number | null = null;
        let freeColorUsed = false;
        let breakEndedAfterLastRed = false;

        for (const shot of shots) {
          if (shot.ballType === "red" && !shot.isFreeBall) {
            currentRedsCount--;
            if (currentRedsCount === 0) {
              lastRedPotterId = shot.playerId;
              breakEndedAfterLastRed = false;
            }
          } else if (shot.ballType === "foul" && currentRedsCount <= 0) {
            breakEndedAfterLastRed = true;
          } else if (shot.ballType !== "foul" && shot.ballType !== "red" && currentRedsCount <= 0) {
            if (shot.isFreeBall) {
              continue;
            }
            
            if (!freeColorUsed && !breakEndedAfterLastRed && shot.playerId === lastRedPotterId) {
              freeColorUsed = true;
            } else {
              strictOrderColorsPotted++;
            }
          }
        }
        setStrictOrderIndex(strictOrderColorsPotted);
      }

      // Calculate Break Sequence
      const currentBreakShots: Shot[] = [];
      const currentPlayerId = frame.currentPlayerTurn;
      
      // Iterate backwards to find current break shots (pots by player OR fouls by opponent)
      for (let i = shots.length - 1; i >= 0; i--) {
        const shot = shots[i];
        
        const isMyPot = shot.playerId === currentPlayerId && !shot.isFoul;
        const isOpponentFoul = shot.playerId !== currentPlayerId && shot.isFoul;

        if (isMyPot || isOpponentFoul) {
          currentBreakShots.unshift(shot);
        } else {
          break;
        }
      }
      setBreakSequence({ shots: currentBreakShots, ownerId: currentPlayerId });
    };

    void calculateStats();
  }, [frame, redsCount]);

  // During respotted black, only 7 points remain (the black ball)
  const remainingPoints = frame.isRespottedBlack 
    ? 7 
    : calculateRemainingPoints(frame.redsRemaining, strictOrderIndex);
  
  const pointDifference = Math.abs(frame.playerOneScore - frame.playerTwoScore);
  const leader = frame.playerOneScore > frame.playerTwoScore 
    ? playerOne.name 
    : frame.playerTwoScore > frame.playerOneScore 
      ? playerTwo.name 
      : null;

  return (
    <>
      <div>
        <div className="stats">
          <article className={`stats__stat ${isPlayerOneTurn ? 'stats__stat--active' : ''}`}>
            <div className="stats__header">
              <h3 className="stats__title">{playerOne.name}</h3>
              <p className="stats__wins">{playerOneFrameWins}</p>
            </div>
            <div className="stats__score">
              <p>{frame.playerOneScore}</p>
            </div>
            <div className="stats__break-info">
              <p>Break: {frame.playerOneBreak}</p>
              <div className="stats__break-sequence" ref={breakSequenceRef1}>
                {isPlayerOneTurn && breakSequence.ownerId === playerOne.id && breakSequence.shots.length > 0 && (
                  breakSequence.shots.map((shot, index) => (
                    <div 
                      key={shot.id || index} 
                      className={`stats__break-ball stats__break-ball--${shot.ballType}`}
                      title={`${shot.ballType} (${shot.points})`}
                    >
                      {(() => {
                        if (shot.isMiss) return <span className="stats__break-text">M</span>;
                        if (shot.isFreeBall) return <span className="stats__break-text">FB</span>;
                        if (shot.isFoul) return <span className="stats__break-text">{shot.foulPoints}</span>;
                        return <span className="stats__break-text">{shot.points}</span>;
                      })()}
                    </div>
                  ))
                )}
              </div>
            </div>
          </article>

          <article className={`stats__stat ${!isPlayerOneTurn ? 'stats__stat--active' : ''}`}>
            <div className="stats__header">
              <h3 className="stats__title">{playerTwo.name}</h3>
              <p className="stats__wins">{playerTwoFrameWins}</p>
            </div>
            <div className="stats__score">
              <p>{frame.playerTwoScore}</p>
            </div>
            <div className="stats__break-info">
              <p>Break: {frame.playerTwoBreak}</p>
              <div className="stats__break-sequence" ref={breakSequenceRef2}>
                {!isPlayerOneTurn && breakSequence.ownerId === playerTwo.id && breakSequence.shots.length > 0 && (
                  breakSequence.shots.map((shot, index) => (
                    <div 
                      key={shot.id || index} 
                      className={`stats__break-ball stats__break-ball--${shot.ballType}`}
                      title={`${shot.ballType} (${shot.points})`}
                    >
                      {(() => {
                        if (shot.isMiss) return <span className="stats__break-text">M</span>;
                        if (shot.isFreeBall) return <span className="stats__break-text">FB</span>;
                        if (shot.isFoul) return <span className="stats__break-text">{shot.foulPoints}</span>;
                        return <span className="stats__break-text">{shot.points}</span>;
                      })()}
                    </div>
                  ))
                )}
              </div>
            </div>
          </article>
        </div>

        <div className="frame-info">
          <p className="frame-info__text">
            Points on table: {remainingPoints}
          </p>

          {leader ? (
            <p className="frame-info__text">
              {leader} holds a {pointDifference}-point lead
            </p>
          ) : (
            <p className="frame-info__text">Players are tied</p>
          )}
        </div>
      </div>
      
      <ShotButtons
        frame={frame}
        gameId={gameId}
        playerOne={playerOne}
        playerTwo={playerTwo}
        initialRedsCount={redsCount}
      />
    </>
  );
}

export default FrameDisplay;
