import { createFileRoute } from '@tanstack/react-router'
import { Tasks } from '#/pages/tasks.page'

export const Route = createFileRoute('/tasks')({ component: Tasks })
