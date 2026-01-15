import { useActiveGame } from "@/features/game/useGameHooks";
import { useActiveFrame, useGameFrames } from "@/features/frame/useFrameHooks";
import { usePlayers } from "@/features/player/usePlayerHooks";
import FrameDisplay from "@/components/FrameDisplay";

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
  const p1FrameWins = allFrames.filter((f) => f.winnerId === playerOne.id).length;
  const p2FrameWins = allFrames.filter((f) => f.winnerId === playerTwo.id).length;

  // Match Score Header (always visible during match)
  const MatchScoreHeader = () => (
    <div>
      <div>Best of {activeGame.bestOfFrames}</div>
      <div>
        {playerOne.name} {p1FrameWins} - {p2FrameWins} {playerTwo.name}
      </div>
    </div>
  );

  // Check if the entire match is completed
  if (activeGame.status === "completed") {
    const matchWinner = p1FrameWins > p2FrameWins ? playerOne : playerTwo;
    return (
      <div>
        <h1>Match Complete!</h1>
        <MatchScoreHeader />
        <p><strong>{matchWinner.name}</strong> wins the match!</p>
      </div>
    );
  }

  if (frameLoading) {
    return (
      <div>
        <MatchScoreHeader />
        <div>Loading frame...</div>
      </div>
    );
  }

  // If there's an active frame, show it with the match score header
  if (activeFrame) {
    return (
      <div>
        <MatchScoreHeader />
        <FrameDisplay
          frame={activeFrame}
          playerOne={playerOne}
          playerTwo={playerTwo}
          gameId={activeGame.id!}
          redsCount={activeGame.redsCount ?? 15}
        />
      </div>
    );
  }

  return <div>Loading frame...</div>;
}

export default FrameContainer;

