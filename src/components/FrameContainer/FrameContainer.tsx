import { useActiveGame } from "@/features/game/useGameHooks";
import { useActiveFrame, useGameFrames } from "@/features/frame/useFrameHooks";
import { usePlayers } from "@/features/player/usePlayerHooks";
import FrameDisplay from "@/components/FrameDisplay";
import MatchScoreHeader from "@/components/MatchScoreHeader";
import MatchCompleteView from "@/components/MatchCompleteView";
import GameControls from "@/components/GameControls";

function FrameContainer() {
  const { data: activeGame } = useActiveGame();
  const { data: activeFrame, isLoading: frameLoading } = useActiveFrame(activeGame?.id);
  const { data: allFrames = [] } = useGameFrames(activeGame?.id);
  const { data: players = [] } = usePlayers();

  if (!activeGame) {
    return null;
  }

  const playerOne = players.find((p) => p.id === activeGame.playerOneId);
  const playerTwo = players.find((p) => p.id === activeGame.playerTwoId);

  if (!playerOne || !playerTwo) {
    return <div>Error: Players not found</div>;
  }

  // Calculate match score (frames won by each player)
  const playerOneFrameWins = allFrames.filter((f) => f.winnerId === playerOne.id).length;
  const playerTwoFrameWins = allFrames.filter((f) => f.winnerId === playerTwo.id).length;

  const matchScoreProps = {
    bestOfFrames: activeGame.bestOfFrames,
    playerOne,
    playerTwo,
    playerOneFrameWins,
    playerTwoFrameWins,
  };

  if (activeGame.status === "completed") {
    return <MatchCompleteView {...matchScoreProps} />;
  }

  if (frameLoading) {
    return (
      <div>
        <MatchScoreHeader {...matchScoreProps} />
        <div>Loading frame...</div>
      </div>
    );
  }

  // If there's an active frame, show it with the match score header
  if (activeFrame) {
    return (
      <div className="form">
        <div className="form__header form__header--game">
          <MatchScoreHeader {...matchScoreProps} currentFrameNumber={activeFrame.frameNumber} />
          <GameControls />
        </div>

        <div className="form__body form__body--game">
          <FrameDisplay
            frame={activeFrame}
            playerOne={playerOne}
            playerTwo={playerTwo}
            gameId={activeGame.id!}
            redsCount={activeGame.redsCount ?? 15}
            playerOneFrameWins={playerOneFrameWins}
            playerTwoFrameWins={playerTwoFrameWins}
          />
        </div>
      </div>
    );
  }

  return <div>Loading frame...</div>;
}

export default FrameContainer;

