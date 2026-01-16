import type { BallType } from "@/config/constants";

export interface Shot {
  id?: number;
  frameId: number;
  playerId: number;
  ballType: BallType;
  points: number;
  isFoul: boolean;
  foulPoints?: number;
  isFreeBall?: boolean;
  isMiss?: boolean;
  timestamp: Date;
}

export interface RecordShotInput {
  frameId: number;
  playerId: number;
  ballType: BallType;
  points: number;
  isFoul?: boolean;
  foulPoints?: number;
  isFreeBall?: boolean;
  isMiss?: boolean;
}

