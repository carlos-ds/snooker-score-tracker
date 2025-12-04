export interface Frame {
  id?: number;
  gameId: number;
  frameNumber: number;
  currentPlayerTurn: number;
  playerOneScore: number;
  playerTwoScore: number;
  playerOneBreak: number;
  playerTwoBreak: number;
  redsRemaining: number;
  status: "active" | "completed";
  winnerId?: number;
  createdAt: Date;
  completedAt?: Date;
}
