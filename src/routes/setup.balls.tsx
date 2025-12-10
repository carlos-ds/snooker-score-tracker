import Balls from '@/pages/Setup/Balls'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/setup/balls')({
  component: Balls,
})
