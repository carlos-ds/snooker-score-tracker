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
  playerOneMissCount: number;
  playerTwoMissCount: number;
  status: FrameStatus;
  winnerId?: number;
  isRespottedBlack?: boolean;
  respottedBlackFirstPlayerId?: number;
  respottedBlackShotCount?: number;
  createdAt: Date;
  completedAt?: Date;
}

export type FrameStatus = "active" | "completed";

export interface CreateFrameInput {
  gameId: number;
  frameNumber: number;
  startingPlayerId: number;
  redsCount: number;
}

export type FrameScoreUpdate = Partial<
  Pick<
    Frame,
    | "playerOneScore"
    | "playerTwoScore"
    | "playerOneBreak"
    | "playerTwoBreak"
    | "redsRemaining"
    | "currentPlayerTurn"
    | "playerOneMissCount"
    | "playerTwoMissCount"
    | "isRespottedBlack"
    | "respottedBlackFirstPlayerId"
    | "respottedBlackShotCount"
  >
>;
