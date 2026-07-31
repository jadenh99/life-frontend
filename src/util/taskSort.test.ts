import { describe, expect, it } from 'vitest'
import type { Task } from '../types/task'
import { sortTasks } from './taskSort'

const tasks: Task[] = [
  {
    id: '1',
    title: 'Later task',
    dueDate: '2026-08-10T00:00:00.000Z',
    priority: 'low',
    completed: false,
    createdAt: '2026-07-01T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'Earlier task',
    dueDate: '2026-07-15T00:00:00.000Z',
    priority: 'high',
    completed: false,
    createdAt: '2026-07-01T00:00:00.000Z',
  },
  {
    id: '3',
    title: 'No due date',
    dueDate: null,
    priority: 'medium',
    completed: false,
    createdAt: '2026-07-01T00:00:00.000Z',
  },
]

describe('sortTasks', () => {
  it('sorts by due date in ascending order with undated tasks last', () => {
    const result = sortTasks(tasks, 'dueDate', 'asc')

    expect(result.map((task) => task.id)).toEqual(['2', '1', '3'])
  })

  it('sorts by priority in descending order', () => {
    const result = sortTasks(tasks, 'priority', 'desc')

    expect(result.map((task) => task.id)).toEqual(['1', '3', '2'])
  })
})
