import type { Task } from '../types/task'

export type SortField = 'dueDate' | 'priority'
export type SortDirection = 'asc' | 'desc'

const priorityOrder: Record<NonNullable<Task['priority']>, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

export function sortTasks(
  tasks: Task[],
  field: SortField,
  direction: SortDirection,
): Task[] {
  const sortedTasks = [...tasks].sort((a, b) => {
    if (field === 'priority') {
      const aPriority = a.priority ?? 'low'
      const bPriority = b.priority ?? 'low'
      const comparison = priorityOrder[aPriority] - priorityOrder[bPriority]
      return direction === 'asc' ? comparison : -comparison
    }

    const aDueDate = a.dueDate
      ? new Date(a.dueDate).getTime()
      : Number.POSITIVE_INFINITY
    const bDueDate = b.dueDate
      ? new Date(b.dueDate).getTime()
      : Number.POSITIVE_INFINITY
    const comparison = aDueDate - bDueDate
    return direction === 'asc' ? comparison : -comparison
  })

  return sortedTasks
}
