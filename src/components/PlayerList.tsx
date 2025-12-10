import { type Player } from "@/lib/Player";

interface PlayerListProps {
  players: Player[];
}

function PlayerList({ players }: PlayerListProps) {
  return (
    <div>
      <h2>Players</h2>
      {players.length === 0 ? (
        <p>No players yet.</p>
      ) : (
        <ul>
          {players.map((player) => (
            <li key={player.id}>{player.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PlayerList;
