import PlayersPage from '@/pages/Setup/PlayersPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/setup/players')({
  component: PlayersPage,
})

