import Statistics from '@/pages/Game/Statistics'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/game/statistics')({
  component: Statistics,
})

