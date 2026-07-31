// @vitest-environment jsdom

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { useEffect } from 'react'
import { TasksProvider, useTasksContext } from './TasksContext'

function TestConsumer() {
  const { tasks, isLoading, hasLoaded, addTask, removeTask } = useTasksContext()

  useEffect(() => {
    if (hasLoaded) {
      return
    }
  }, [hasLoaded])

  return (
    <div>
      <div>{isLoading ? 'loading' : 'loaded'}</div>
      <div data-testid="task-count">{tasks.length}</div>
      <button
        type="button"
        onClick={() =>
          void addTask({ title: 'New task', dueDate: null, priority: 'high' })
        }
      >
        add
      </button>
      <button type="button" onClick={() => void removeTask('1')}>
        remove
      </button>
    </div>
  )
}

describe('TasksProvider', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((_, init?: RequestInit) => {
        if (init?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue({
              id: '2',
              title: 'New task',
              priority: 'high',
              completed: false,
              createdAt: '2024-01-01T00:00:00.000Z',
            }),
          })
        }

        if (init?.method === 'DELETE') {
          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue({}),
          })
        }

        return Promise.resolve({
          json: vi
            .fn()
            .mockResolvedValue({ data: [{ id: '1', title: 'Test task' }] }),
        })
      }),
    )
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('loads tasks once and exposes them through context', async () => {
    render(
      <TasksProvider>
        <TestConsumer />
      </TasksProvider>,
    )

    expect(screen.getByText('loading')).toBeTruthy()

    await waitFor(() => expect(screen.getByText('loaded')).toBeTruthy())
    expect(screen.getByTestId('task-count').textContent).toBe('1')
  })

  it('exposes addTask and removeTask through context', async () => {
    render(
      <TasksProvider>
        <TestConsumer />
      </TasksProvider>,
    )

    await waitFor(() => expect(screen.getByText('loaded')).toBeTruthy())

    screen.getAllByRole('button', { name: 'add' })[0].click()

    await waitFor(() =>
      expect(screen.getByTestId('task-count').textContent).toBe('2'),
    )

    screen.getAllByRole('button', { name: 'remove' })[0].click()

    await waitFor(() =>
      expect(screen.getByTestId('task-count').textContent).toBe('1'),
    )
  })
})
