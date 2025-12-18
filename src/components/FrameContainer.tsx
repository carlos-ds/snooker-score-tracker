import { useActiveGameQuery } from "@/hooks/useGameQueries";
import { useActiveFrameQuery } from "@/hooks/useFrameQueries";
import { usePlayersQuery } from "@/hooks/usePlayerQueries";
import FrameDisplay from "./FrameDisplay";

function FrameContainer() {
  const { data: activeGame } = useActiveGameQuery();
  const { data: activeFrame, isLoading } = useActiveFrameQuery(activeGame?.id);
  const { data: players = [] } = usePlayersQuery();

  // Don't show anything if no active game
  if (!activeGame) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return <div>Loading frame...</div>;
  }

  // Find the players
  const playerOne = players.find((p) => p.id === activeGame.playerOneId);
  const playerTwo = players.find((p) => p.id === activeGame.playerTwoId);

  if (!playerOne || !playerTwo) {
    return <div>Error: Players not found</div>;
  }

  // If there's an active frame, show it
  if (activeFrame) {
    return (
      <FrameDisplay
        frame={activeFrame}
        playerOne={playerOne}
        playerTwo={playerTwo}
        gameId={activeGame.id!}
      />
    );
  }

  return null;
}

export default FrameContainer;
