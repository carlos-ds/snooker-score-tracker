import { createFileRoute, redirect } from "@tanstack/react-router";
import Home from "@/pages/Home/Home";
import { getActiveGame } from "@/features/game/operations";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const activeGame = await getActiveGame();
    
    if (activeGame) {
      throw redirect({
        to: "/game",
      });
    }
  },
  component: Home,
});

