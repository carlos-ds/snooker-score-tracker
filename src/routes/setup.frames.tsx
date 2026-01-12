import FramesPage from '@/pages/Setup/FramesPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/setup/frames')({
  component: FramesPage,
})

