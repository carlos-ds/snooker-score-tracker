import Game from '@/pages/Game/Game'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { getActiveGame } from "@/features/game/operations";

export const Route = createFileRoute('/game')({
  beforeLoad: async () => {
    const activeGame = await getActiveGame();
    if (!activeGame) {
      throw redirect({
        to: "/",
      });
    }
  },
  component: Game,
})