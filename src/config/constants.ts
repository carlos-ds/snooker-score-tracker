export const SNOOKER_RULES = {
  INITIAL_REDS: 15,
  INITIAL_SCORE: 0,
  INITIAL_BREAK: 0,
} as const;

export const BALL_POINTS = {
  red: 1,
  yellow: 2,
  green: 3,
  brown: 4,
  blue: 5,
  pink: 6,
  black: 7,
} as const;

export const BALL_COLORS_ORDER = [
  "yellow",
  "green",
  "brown",
  "blue",
  "pink",
  "black",
] as const;

export type BallType = keyof typeof BALL_POINTS | "foul" | "freeball";
export type ColorBallType = (typeof BALL_COLORS_ORDER)[number];

export const GAME_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
} as const;

export const FRAME_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
} as const;

export const QUERY_KEYS = {
  ACTIVE_GAME: ["game", "active"],
  GAMES: ["games"],
  ACTIVE_FRAME: ["frame", "active"],
  GAME_FRAMES: ["frame", "byGame"],
  PLAYERS: ["players"],
  SHOTS: ["shots"],
} as const;


export const FOUL_BALLS = [
  { ball: "red", points: 4 },
  { ball: "yellow", points: 4 },
  { ball: "green", points: 4 },
  { ball: "brown", points: 4 },
  { ball: "blue", points: 5 },
  { ball: "pink", points: 6 },
  { ball: "black", points: 7 },
] as const;

