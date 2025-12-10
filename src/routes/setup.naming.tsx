import Naming from '@/pages/Setup/Naming'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/setup/naming')({
  component: Naming,
})

