import Statistics from "@/pages/Statistics/Statistics";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { getLatestGame } from "@/features/game/operations";

export const Route = createFileRoute("/statistics")({
    beforeLoad: async () => {
        // Allow access if there's any game (active or recently completed)
        const latestGame = await getLatestGame();
        if (!latestGame) {
            throw redirect({
                to: "/",
            });
        }
    },
    component: Statistics,
});
