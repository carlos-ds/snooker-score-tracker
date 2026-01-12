import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { usePlayers, useCreatePlayer, useDeleteAllPlayers } from "@/features/player/usePlayerHooks";
import { useActiveGame, useCreateGame, useResetGameData } from "@/features/game/useGameHooks";
import NavButton from "@/components/NavButton/NavButton";
import "./AddPlayer.css";

//  DEV_MODE: Set to false before production deployment
const DEV_MODE = true;

function AddPlayer() {
  const navigate = useNavigate();
  
  // Get mode from localStorage during initialization
  const [mode] = useState<string>(() => {
    const storedMode = localStorage.getItem("modes");
    return (storedMode === "1v1" || storedMode === "team") ? storedMode : "1v1";
  });
  const [step, setStep] = useState<1 | 2>(1);
  
  // 1v1 mode: player1 and player2
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  
  // Team mode: team1Player1, team1Player2, team2Player1, team2Player2
  const [team1Player1, setTeam1Player1] = useState("");
  const [team1Player2, setTeam1Player2] = useState("");
  const [team2Player1, setTeam2Player1] = useState("");
  const [team2Player2, setTeam2Player2] = useState("");

  const { data: players = [] } = usePlayers();
  const { data: activeGame } = useActiveGame();
  const createPlayerMutation = useCreatePlayer();
  const createGameMutation = useCreateGame();
  const resetGameDataMutation = useResetGameData();
  const deleteAllPlayersMutation = useDeleteAllPlayers();

  // Only hide if we have players but no active game (setup complete state)
  if (!activeGame && players.length >= 2) {
    return null;
  }

  // If there's an active game, show message instead of form
  if (activeGame) {
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
      <div className="form">
        <div className="form__body">
          <div className="game-in-progress">
            <h2>Game in Progress</h2>
            <p>A game is currently active. Please finish the current game before starting a new one.</p>
            
            {/*  DEV_MODE: Remove this button before production */}
            {DEV_MODE && (
              <button
                onClick={handleDevEndGame}
                disabled={resetGameDataMutation.isPending || deleteAllPlayersMutation.isPending}
                style={{
                  marginTop: '24px',
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
            )}
          </div>
        </div>
      </div>
    );
  }

  // 1v1 MODE HANDLERS
  const handleStartGame1v1 = async () => {
    const trimmedPlayer1 = player1.trim();
    const trimmedPlayer2 = player2.trim();

    if (!trimmedPlayer1 || !trimmedPlayer2) {
      return;
    }

    if (trimmedPlayer1 === trimmedPlayer2) {
      alert("Player names must be different!");
      return;
    }

    try {
      const [playerOneId, playerTwoId] = await Promise.all([
        createPlayerMutation.mutateAsync({ name: trimmedPlayer1, highestBreak: 0 }),
        createPlayerMutation.mutateAsync({ name: trimmedPlayer2, highestBreak: 0 }),
      ]);

      if (playerOneId && playerTwoId) {
        await createGameMutation.mutateAsync({
          playerOneId,
          playerTwoId,
        });
      }

      setPlayer1("");
      setPlayer2("");
      navigate({ to: "/game" });
    } catch (error) {
      console.error("Failed to start game:", error);
    }
  };

  // TEAM MODE HANDLERS
  const handleNextTeam = () => {
    const trimmed1 = team1Player1.trim();
    const trimmed2 = team1Player2.trim();

    if (!trimmed1 || !trimmed2) {
      alert("Please enter both team 1 player names!");
      return;
    }

    if (trimmed1 === trimmed2) {
      alert("Player names must be different!");
      return;
    }

    setStep(2);
  };

  const handleStartGameTeam = async () => {
    const trimmed1 = team2Player1.trim();
    const trimmed2 = team2Player2.trim();

    if (!trimmed1 || !trimmed2) {
      alert("Please enter both team 2 player names!");
      return;
    }

    const allNames = [
      team1Player1.trim(),
      team1Player2.trim(),
      team2Player1.trim(),
      team2Player2.trim(),
    ];

    const uniqueNames = new Set(allNames);
    if (uniqueNames.size !== 4) {
      alert("All player names must be unique!");
      return;
    }

    try {
      // Create all 4 players
      await Promise.all([
        createPlayerMutation.mutateAsync({ name: team1Player1.trim(), highestBreak: 0 }),
        createPlayerMutation.mutateAsync({ name: team1Player2.trim(), highestBreak: 0 }),
        createPlayerMutation.mutateAsync({ name: team2Player1.trim(), highestBreak: 0 }),
        createPlayerMutation.mutateAsync({ name: team2Player2.trim(), highestBreak: 0 }),
      ]);

      // For team mode, players are created in the database
      // Game creation logic can be customized based on team requirements
      // For now, we just create the players without starting a game automatically

      setTeam1Player1("");
      setTeam1Player2("");
      setTeam2Player1("");
      setTeam2Player2("");
      setStep(1);
      navigate({ to: "/game" });
    } catch (error) {
      console.error("Failed to start game:", error);
    }
  };

  const isLoading = createPlayerMutation.isPending || createGameMutation.isPending;

  // 1v1 MODE RENDER
  if (mode === "1v1") {
    const canStart = player1.trim() && player2.trim();

    return (
      <div className="form">
        <div className="form__body">
          <div className="player-inputs">
            <div className="player-input-group">
              <label className="player-label">Player 1</label>
              <input
                type="text"
                value={player1}
                onChange={(e) => setPlayer1(e.target.value)}
                placeholder="Enter name..."
                className="player-input"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && canStart && handleStartGame1v1()}
              />
            </div>

            <div className="vs-divider">VS</div>

            <div className="player-input-group">
              <label className="player-label">Player 2</label>
              <input
                type="text"
                value={player2}
                onChange={(e) => setPlayer2(e.target.value)}
                placeholder="Enter name..."
                className="player-input"
                onKeyDown={(e) => e.key === "Enter" && canStart && handleStartGame1v1()}
              />
            </div>
          </div>
        </div>

        <div className="form__footer">
          <NavButton prev />
          <NavButton next onSubmit={handleStartGame1v1} disabled={!canStart || isLoading} />
        </div>
      </div>
    );
  }

  // TEAM MODE RENDER
  if (mode === "team") {
    if (step === 1) {
      const canProceed = team1Player1.trim() && team1Player2.trim();

      return (
        <div className="form">
          <div className="form__body">
            <h2 className="team-title">Team 1</h2>
            <div className="player-inputs">
              <div className="player-input-group">
                <label className="player-label">Player 1</label>
                <input
                  type="text"
                  value={team1Player1}
                  onChange={(e) => setTeam1Player1(e.target.value)}
                  placeholder="Enter name..."
                  className="player-input"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && canProceed && handleNextTeam()}
                />
              </div>

              <div className="player-input-group">
                <label className="player-label">Player 2</label>
                <input
                  type="text"
                  value={team1Player2}
                  onChange={(e) => setTeam1Player2(e.target.value)}
                  placeholder="Enter name..."
                  className="player-input"
                  onKeyDown={(e) => e.key === "Enter" && canProceed && handleNextTeam()}
                />
              </div>
            </div>
          </div>

          <div className="form__footer">
            <NavButton prev />
            <NavButton next onSubmit={handleNextTeam} disabled={!canProceed} />
          </div>
        </div>
      );
    }

    // Step 2: Team 2
    const canStart = team2Player1.trim() && team2Player2.trim();

    return (
      <div className="form">
        <div className="form__body">
          <h2 className="team-title">Team 2</h2>
          <div className="player-inputs">
            <div className="player-input-group">
              <label className="player-label">Player 1</label>
              <input
                type="text"
                value={team2Player1}
                onChange={(e) => setTeam2Player1(e.target.value)}
                placeholder="Enter name..."
                className="player-input"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && canStart && handleStartGameTeam()}
              />
            </div>

            <div className="player-input-group">
              <label className="player-label">Player 2</label>
              <input
                type="text"
                value={team2Player2}
                onChange={(e) => setTeam2Player2(e.target.value)}
                placeholder="Enter name..."
                className="player-input"
                onKeyDown={(e) => e.key === "Enter" && canStart && handleStartGameTeam()}
              />
            </div>
          </div>
        </div>

        <div className="form__footer">
          <NavButton prev onSubmit={() => setStep(1)} />
          <NavButton next onSubmit={handleStartGameTeam} disabled={!canStart || isLoading} />
        </div>
      </div>
    );
  }

  return null;
}

export default AddPlayer;
