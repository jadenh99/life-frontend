import { useTasksContext } from '#/context/TasksContext'
import {
  formatDueDateForDisplay,
  getDateString,
  getTimeOfDay,
} from '#/util/dateUtil'
import { getUpcomingTasksSummary } from '#/util/upcomingTasks'
import { useMemo } from 'react'

export function Home() {
  const { tasks } = useTasksContext()

  const upcomingTasksSummary = useMemo(
    () => getUpcomingTasksSummary(tasks),
    [tasks],
  )

  const soonestTaskDate = formatDueDateForDisplay(
    upcomingTasksSummary.soonestTask?.dueDate,
  )

  return (
    <div className="p-8">
      <span className="opacity-80">{getDateString()}</span>
      <h1 className="text-4xl font-bold">Good {getTimeOfDay()}, Jaden</h1>
      <div className="mt-8">
        {upcomingTasksSummary.count > 0 ? (
          <p className="text-lg text-mist-100">
            You have {upcomingTasksSummary.count}{' '}
            {upcomingTasksSummary.count === 1 ? 'task' : 'tasks'} due within the
            next 7 days, take a look.
          </p>
        ) : null}
        {upcomingTasksSummary.soonestTask ? (
          <p className="mt-2 text-sm text-mist-300">
            Soonest task: {upcomingTasksSummary.soonestTask.title} —{' '}
            {soonestTaskDate}
          </p>
        ) : (
          <p>no task!</p>
        )}
      </div>
    </div>
  )
}
