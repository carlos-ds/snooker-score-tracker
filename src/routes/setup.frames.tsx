import Frames from '@/pages/Setup/Frames'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/setup/frames')({
  component: Frames,
})

