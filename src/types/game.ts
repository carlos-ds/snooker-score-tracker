export interface Game {
  id?: number;
  playerOneId: number;
  playerTwoId: number;
  redsCount: number;
  bestOfFrames: number;
  createdAt: Date;
  status: GameStatus;
}

export type GameStatus = "active" | "completed";

export interface CreateGameInput {
  playerOneId: number;
  playerTwoId: number;
  redsCount: number;
  bestOfFrames: number;
}
