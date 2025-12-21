export interface Player {
  id?: number;
  name: string;
}

export type CreatePlayerInput = Omit<Player, "id">;
