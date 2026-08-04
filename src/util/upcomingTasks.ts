import { normalizeToDateOnly, parseDueDate } from './dateUtil'
import { sortTasks } from './taskSort'
import type { Task } from '../types/task'

export interface UpcomingTasksSummary {
  count: number
  soonestTask: Task | null
}

export function getUpcomingTasksSummary(
  tasks: Task[],
  now: Date = new Date(),
): UpcomingTasksSummary {
  const nowDateOnly = normalizeToDateOnly(now)
  const oneWeekFromNow = new Date(nowDateOnly)
  oneWeekFromNow.setDate(nowDateOnly.getDate() + 7)

  const upcomingTasks = tasks.filter((task) => {
    if (task.completed) {
      return false
    }

    const dueDate = parseDueDate(task.dueDate)
    if (!dueDate) {
      return false
    }

    return dueDate >= nowDateOnly && dueDate <= oneWeekFromNow
  })

  const sortedUpcomingTasks = sortTasks(upcomingTasks, 'dueDate', 'asc')
  const soontestTask = sortTasks(tasks, 'dueDate', 'asc')[0] ?? null

  return {
    count: sortedUpcomingTasks.length,
    soonestTask: soontestTask,
  }
}
