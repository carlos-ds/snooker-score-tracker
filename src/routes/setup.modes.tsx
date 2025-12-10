import Mode from '@/pages/Setup/Modes'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/setup/modes')({
  component: Mode,
})
