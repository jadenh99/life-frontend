import type { Task } from '../types/task'

export interface UpcomingTasksSummary {
  count: number
  soonestTask: Task | null
}

function normalizeToDateOnly(value: Date) {
  const normalized = new Date(value)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

function parseDueDate(value?: string | null) {
  if (!value) {
    return null
  }

  const trimmedValue = value.trim()

  const parsedDate = new Date(trimmedValue)
  if (!Number.isNaN(parsedDate.getTime())) {
    return normalizeToDateOnly(parsedDate)
  }

  const dayMonthYearMatch = trimmedValue.match(
    /^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})$/,
  )
  if (dayMonthYearMatch) {
    const [, dayText, monthText, yearText] = dayMonthYearMatch
    const parsedMonth = new Date(`${monthText} 1, 2000`).getMonth()
    const parsedDay = Number(dayText)
    const parsedYear = Number(yearText)

    if (
      !Number.isNaN(parsedMonth) &&
      !Number.isNaN(parsedDay) &&
      !Number.isNaN(parsedYear)
    ) {
      const normalized = new Date(parsedYear, parsedMonth, parsedDay)
      return normalizeToDateOnly(normalized)
    }
  }

  return null
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

  const sortedUpcomingTasks = [...upcomingTasks].sort((left, right) => {
    const leftDate =
      parseDueDate(left.dueDate)?.getTime() ?? Number.POSITIVE_INFINITY
    const rightDate =
      parseDueDate(right.dueDate)?.getTime() ?? Number.POSITIVE_INFINITY
    return leftDate - rightDate
  })

  return {
    count: sortedUpcomingTasks.length,
    soonestTask: sortedUpcomingTasks[0] ?? null,
  }
}
