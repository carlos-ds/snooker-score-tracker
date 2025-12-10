export interface Shot {
  id?: number;
  frameId: number;
  playerId: number;
  ballType: "red" | "yellow" | "green" | "brown" | "blue" | "pink" | "black";
  points: number;
  isFoul: boolean;
  foulPoints?: number;
  timestamp: Date;
}
