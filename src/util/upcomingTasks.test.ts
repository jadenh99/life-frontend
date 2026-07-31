import { describe, expect, it } from 'vitest'
import type { Task } from '../types/task'
import { getUpcomingTasksSummary } from './upcomingTasks'

function createTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Example task',
    description: '',
    dueDate: '2026-07-31T00:00:00.000Z',
    priority: 'medium',
    completed: false,
    createdAt: '2026-07-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('getUpcomingTasksSummary', () => {
  it('returns the number of tasks due in the next 7 days and the soonest one', () => {
    const now = new Date('2026-07-31T12:00:00.000Z')
    const tasks: Task[] = [
      createTask({
        id: '1',
        title: 'Submit proposal',
        dueDate: '2026-08-02T00:00:00.000Z',
      }),
      createTask({
        id: '2',
        title: 'Book dentist',
        dueDate: '2026-08-04T00:00:00.000Z',
      }),
      createTask({
        id: '3',
        title: 'Already done',
        completed: true,
        dueDate: '2026-08-01T00:00:00.000Z',
      }),
      createTask({
        id: '4',
        title: 'Later task',
        dueDate: '2026-08-15T00:00:00.000Z',
      }),
    ]

    const summary = getUpcomingTasksSummary(tasks, now)

    expect(summary.count).toBe(2)
    expect(summary.soonestTask?.title).toBe('Submit proposal')
  })

  it('parses backend-formatted dates such as "31 July 2026"', () => {
    const now = new Date('2026-07-31T12:00:00.000Z')
    const tasks: Task[] = [
      createTask({ id: '1', title: 'Today task', dueDate: '31 July 2026' }),
    ]

    const summary = getUpcomingTasksSummary(tasks, now)

    expect(summary.count).toBe(1)
    expect(summary.soonestTask?.title).toBe('Today task')
  })

  it('returns no upcoming tasks when none are due soon', () => {
    const now = new Date('2026-07-31T12:00:00.000Z')
    const tasks: Task[] = [
      createTask({
        id: '1',
        title: 'Later task',
        dueDate: '2026-08-15T00:00:00.000Z',
      }),
    ]

    const summary = getUpcomingTasksSummary(tasks, now)

    expect(summary.count).toBe(0)
    expect(summary.soonestTask).toBeNull()
  })
})
