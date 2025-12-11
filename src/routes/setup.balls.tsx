import BallsPage from '@/pages/Setup/BallsPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/setup/balls')({
  component: BallsPage,
})
