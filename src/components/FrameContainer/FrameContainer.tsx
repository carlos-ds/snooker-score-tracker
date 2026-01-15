import { useActiveGame } from "@/features/game/useGameHooks";
import { useActiveFrame, useCreateFrame, useGameFrames } from "@/features/frame/useFrameHooks";
import { usePlayers } from "@/features/player/usePlayerHooks";
import FrameDisplay from "@/components/FrameDisplay/FrameDisplay";

function FrameContainer() {
  const { data: activeGame } = useActiveGame();
  const { data: activeFrame, isLoading } = useActiveFrame(activeGame?.id);
  const { data: allFrames = [] } = useGameFrames(activeGame?.id);
  const { data: players = [] } = usePlayers();
  const createFrameMutation = useCreateFrame();

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

  // Get the last completed frame if no active frame
  const lastCompletedFrame = allFrames
    .filter((f) => f.status === "completed")
    .sort((a, b) => b.frameNumber - a.frameNumber)[0];

  const handleStartNextFrame = async () => {
    if (!activeGame.id) return;

    // Determine the next frame number
    const nextFrameNumber = lastCompletedFrame 
      ? lastCompletedFrame.frameNumber + 1 
      : 1;

    // The loser of the previous frame breaks in the next frame
    // If no previous frame, player one starts
    const startingPlayerId = lastCompletedFrame?.winnerId === playerOne.id
      ? playerTwo.id!
      : playerOne.id!;

    try {
      await createFrameMutation.mutateAsync({
        gameId: activeGame.id,
        frameNumber: nextFrameNumber,
        startingPlayerId,
      });
    } catch (error) {
      console.error("Failed to create next frame:", error);
    }
  };

  // Show active frame (either in-progress or just completed)
  if (activeFrame) {
    return (
      <FrameDisplay
        frame={activeFrame}
        playerOne={playerOne}
        playerTwo={playerTwo}
        gameId={activeGame.id!}
        onStartNextFrame={handleStartNextFrame}
      />
    );
  }

  // Show last completed frame with option to start next
  if (lastCompletedFrame) {
    return (
      <FrameDisplay
        frame={lastCompletedFrame}
        playerOne={playerOne}
        playerTwo={playerTwo}
        gameId={activeGame.id!}
        onStartNextFrame={handleStartNextFrame}
      />
    );
  }

  return null;
}

export default FrameContainer;

