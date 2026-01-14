import Header from "@/components/Header/Header";
import FrameContainer from "@/components/FrameContainer";
import GameMenu from "@/components/GameMenu/GameMenu";
import { useActiveGame } from "@/features/game/useGameHooks";
import { usePlayers } from "@/features/player/usePlayerHooks";
import "./Game.css";

function Game() {
  const { data: activeGame } = useActiveGame();
  const { data: players = [] } = usePlayers();

  if (!activeGame) {
    return (
      <>
        <Header pageType="text" pageTitle="GAME" />
        <main className="game-main">
          <h2>No Active Game</h2>
          <p>Please start a new game from the setup page.</p>
        </main>
      </>
    );
  }

  const playerOne = players.find((p) => p.id === activeGame.playerOneId);
  const playerTwo = players.find((p) => p.id === activeGame.playerTwoId);

  return (
    <>
      <div className="game-header">
        <Header 
          pageType="text" 
          pageTitle={`${playerOne?.name || "Player 1"} VS ${playerTwo?.name || "Player 2"}`} 
        />
        <GameMenu />
      </div>
      <main className="game-main">
        <FrameContainer />
      </main>
    </>
  );
}

export default Game