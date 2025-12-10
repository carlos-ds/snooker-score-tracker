import { useActiveGameQuery } from "@/hooks/useGameQueries";
import {
  useActiveFrameQuery,
  useCreateFrameMutation,
  useGameFramesQuery,
} from "@/hooks/useFrameQueries";

function FrameControls() {
  const { data: activeGame } = useActiveGameQuery();
  const { data: activeFrame } = useActiveFrameQuery(activeGame?.id);
  const { data: gameFrames = [] } = useGameFramesQuery(activeGame?.id);
  const createFrameMutation = useCreateFrameMutation();

  // Don't show if no active game or if there's an active frame
  if (!activeGame || activeFrame) {
    return null;
  }

  // Calculate next frame number
  const nextFrameNumber = gameFrames.length + 1;

  // Determine starting player (alternate who starts each frame)
  const lastFrame = gameFrames[gameFrames.length - 1];
  const lastStartingPlayerId = lastFrame?.currentPlayerTurn;

  // If player one started last, player two starts next
  const nextStartingPlayerId =
    lastStartingPlayerId === activeGame.playerOneId
      ? activeGame.playerTwoId
      : activeGame.playerOneId;

  const handleStartFrame = async () => {
    if (!activeGame.id) return;

    try {
      await createFrameMutation.mutateAsync({
        gameId: activeGame.id,
        frameNumber: nextFrameNumber,
        startingPlayerId: nextStartingPlayerId,
      });
    } catch (error) {
      console.error("Failed to start frame:", error);
    }
  };

  return (
    <div>
      <h3>Frame {nextFrameNumber - 1} Complete!</h3>
      <p>Ready for frame {nextFrameNumber}?</p>
      <button
        onClick={handleStartFrame}
        disabled={createFrameMutation.isPending}
      >
        {createFrameMutation.isPending
          ? "Starting..."
          : `Start Frame ${nextFrameNumber}`}
      </button>
    </div>
  );
}

export default FrameControls;
