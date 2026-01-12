// Import navigation hook for redirecting after data reset
import { useNavigate } from "@tanstack/react-router";
import { useActiveGame, useResetGameData } from "@/features/game/useGameHooks";
import { useActiveFrame, useGameFrames, useCreateFrame, useCompleteFrame } from "@/features/frame/useFrameHooks";
import { usePlayers } from "@/features/player/usePlayerHooks";
import FrameDisplay from "./FrameDisplay";

function FrameContainer() {
  // Navigation hook for redirecting user after reset
  const navigate = useNavigate();
  const { data: activeGame } = useActiveGame();
  const { data: activeFrame, isLoading: isFrameLoading } = useActiveFrame(activeGame?.id);
  const { data: gameFrames = [], isLoading: isFramesLoading } = useGameFrames(activeGame?.id);
  const { data: players = [], isLoading: isPlayersLoading } = usePlayers();
  
  // Mutation hooks for frame management
  const resetGameDataMutation = useResetGameData();
  const createFrameMutation = useCreateFrame();
  const completeFrameMutation = useCompleteFrame();

  if (!activeGame) {
    return null;
  }

  // Wait for both frame and players data to load before checking for players
  // This prevents false "players not found" errors during initial data fetch
  if (isFrameLoading || isFramesLoading || isPlayersLoading) {
    return <div>Loading...</div>;
  }

  // Find the two players by their IDs stored in the active game
  const playerOne = players.find((p) => p.id === activeGame.playerOneId);
  const playerTwo = players.find((p) => p.id === activeGame.playerTwoId);

  // Handle data corruption: if game exists but players are missing from database
  // This can happen if players were deleted but game wasn't properly cleaned up
  if (!playerOne || !playerTwo) {
    // Handler to reset all game data and navigate back to home
    const handleReset = async () => {
      await resetGameDataMutation.mutateAsync();
      navigate({ to: "/" });
    };

    // Display error message with reset option to recover from corrupted state
    return (
      <div>
        <h2>Data Error</h2>
        <p>The game data is corrupted. Players are missing.</p>
        <button onClick={handleReset} disabled={resetGameDataMutation.isPending}>
          {resetGameDataMutation.isPending ? "Resetting..." : "Reset Game"}
        </button>
      </div>
    );
  }

  // Get the required number of frames from localStorage
  const framesNeeded = (() => {
    const stored = localStorage.getItem("frames");
    if (stored === "custom") {
      const customValue = localStorage.getItem("frames-custom");
      return customValue ? parseInt(customValue, 10) : 1;
    }
    return stored ? parseInt(stored, 10) : 1;
  })();

  const handleFrameComplete = async (winnerId: number) => {
    try {
      if (!activeFrame?.id) return;

      // Complete the current frame
      await completeFrameMutation.mutateAsync({
        frameId: activeFrame.id,
        winnerId,
        gameId: activeGame.id!,
      });

      // Check if we need more frames
      const framesCompleted = gameFrames.filter(f => f.status === "completed").length + 1;
      
      if (framesCompleted < framesNeeded) {
        // Create next frame
        const nextFrameNumber = gameFrames.length + 1;
        // Alternate starting player
        const nextStartingPlayerId = activeFrame.currentPlayerTurn === playerOne.id 
          ? playerTwo.id! 
          : playerOne.id!;

        await createFrameMutation.mutateAsync({
          gameId: activeGame.id!,
          frameNumber: nextFrameNumber,
          startingPlayerId: nextStartingPlayerId,
        });
      } else {
        // All frames complete - game is over
        navigate({ to: "/game/statistics" });
      }
    } catch (error) {
      console.error("Failed to complete frame:", error);
    }
  };

  if (activeFrame) {
    return (
      <FrameDisplay
        frame={activeFrame}
        playerOne={playerOne}
        playerTwo={playerTwo}
        gameId={activeGame.id!}
        onFrameComplete={handleFrameComplete}
      />
    );
  }

  return null;
}

export default FrameContainer;
