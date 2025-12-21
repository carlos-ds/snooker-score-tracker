import { useActiveGame } from "@/features/game/useGameHooks";
import { useActiveFrame } from "@/features/frame/useFrameHooks";
import { usePlayers } from "@/features/player/usePlayerHooks";
import FrameDisplay from "./FrameDisplay";

function FrameContainer() {
  const { data: activeGame } = useActiveGame();
  const { data: activeFrame, isLoading } = useActiveFrame(activeGame?.id);
  const { data: players = [] } = usePlayers();

  if (!activeGame) {
    return null;
  }

  if (isLoading) {
    return <div>Loading frame...</div>;
  }

  const playerOne = players.find((p) => p.id === activeGame.playerOneId);
  const playerTwo = players.find((p) => p.id === activeGame.playerTwoId);

  if (!playerOne || !playerTwo) {
    return <div>Error: Players not found</div>;
  }

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
