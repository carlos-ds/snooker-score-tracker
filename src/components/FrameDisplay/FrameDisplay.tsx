import { useEffect, useState } from "react";
import type { Frame, Player } from "@/types";
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

  useEffect(() => {
    const calculateStrictOrderIndex = async () => {
      if (!frame.id || frame.redsRemaining > 0) {
        setStrictOrderIndex(0);
        return;
      }

      const shots = await getShotsByFrame(frame.id);
      
      // Calculate how many strict order colors have been potted
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
    };

    void calculateStrictOrderIndex();
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
              <p>Break: {frame.playerOneBreak}</p>
          </article>

          <article className={`stats__stat ${!isPlayerOneTurn ? 'stats__stat--active' : ''}`}>
            <div className="stats__header">
              <h3 className="stats__title">{playerTwo.name}</h3>
              <p className="stats__wins">{playerTwoFrameWins}</p>
            </div>
            <div className="stats__score">
              <p>{frame.playerTwoScore}</p>
            </div>
            <p>Break: {frame.playerTwoBreak}</p>
          </article>
        </div>

        <div className="frame-info">
          <p className="frame-info__text">
            Remaining points: {remainingPoints}
          </p>

          {leader ? (
            <p className="frame-info__text">
              {leader} holds a {pointDifference}-point lead
            </p>
          ) : (
            <p className="frame-info__text">Both players are tied</p>
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

