import ModesPage from '@/pages/Setup/ModesPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/setup/modes')({
  component: ModesPage,
})
