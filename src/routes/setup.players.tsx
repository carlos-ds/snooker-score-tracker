import Players from '@/pages/Setup/Players'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/setup/players')({
  component: Players,
})

