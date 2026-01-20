import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useActiveGame } from "@/features/game/useGameHooks";
import FrameContainer from "@/components/FrameContainer";

function Game() {
  const navigate = useNavigate();
  const { data: activeGame, isLoading } = useActiveGame();

  useEffect(() => {
    if (!isLoading && !activeGame) {
      navigate({ to: "/" });
    }
  }, [activeGame, isLoading, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!activeGame) {
    return null;
  }

  return (
    <>
      <main>
        <FrameContainer />
      </main>
    </>
  )
}

export default Game