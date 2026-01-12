export interface Player {
  id?: number;
  name: string;
  highestBreak: number;
}

export type CreatePlayerInput = Omit<Player, "id">;
