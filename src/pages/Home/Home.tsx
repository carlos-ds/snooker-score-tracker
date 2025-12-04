import AddPlayer from "@/components/AddPlayer";
import PlayerList from "@/components/PlayerList";
import GameControls from "@/components/GameControls";
import { usePlayersQuery } from "@/hooks/usePlayerQueries";

function Home() {
  const { data: players = [], isLoading, error } = usePlayersQuery();

  if (isLoading) {
    return <div>Loading players...</div>;
  }

  if (error) {
    return <div>Error loading players: {(error as Error).message}</div>;
  }

  return (
    <>
      <AddPlayer />
      <PlayerList players={players} />
      <GameControls />
    </>
  );
}

export default Home;
