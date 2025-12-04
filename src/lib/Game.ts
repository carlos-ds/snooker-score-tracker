export interface Game {
  id?: number;
  playerOneId: number;
  playerTwoId: number;
  createdAt: Date;
  status: "active" | "completed";
}
