import { useNavigate } from "@tanstack/react-router";
import Header from "@/components/Header/Header";
import FrameContainer from "@/components/FrameContainer";
import { useActiveGame, useResetGameData } from "@/features/game/useGameHooks";
import { usePlayers, useDeleteAllPlayers } from "@/features/player/usePlayerHooks";
import "./Game.css";

//  DEV_MODE: Set to false before production deployment
const DEV_MODE = true;

function Game() {
  const navigate = useNavigate();
  const { data: activeGame } = useActiveGame();
  const { data: players = [] } = usePlayers();
  const resetGameDataMutation = useResetGameData();
  const deleteAllPlayersMutation = useDeleteAllPlayers();

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

  //  DEV_MODE: End game button for development

  const handleDevEndGame = async () => {
    try {
      await resetGameDataMutation.mutateAsync();
      await deleteAllPlayersMutation.mutateAsync();
      navigate({ to: "/setup/balls" });
    } catch (error) {
      console.error("Failed to end game:", error);
    }
  };

  return (
    <>
      <Header 
        pageType="text" 
        pageTitle={`${playerOne?.name || "Player 1"} VS ${playerTwo?.name || "Player 2"}`} 
      />
      <main className="game-main">
        <FrameContainer />
        
        {/*  DEV_MODE: Remove this button before production */}
        {DEV_MODE && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9998,
          }}>
            <button
              onClick={handleDevEndGame}
              disabled={resetGameDataMutation.isPending || deleteAllPlayersMutation.isPending}
              style={{
                padding: '12px 24px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              🔧 DEV: End Game
            </button>
          </div>
        )}
      </main>
    </>
  );
}

export default Game