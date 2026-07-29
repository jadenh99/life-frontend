// @vitest-environment jsdom

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { useEffect } from 'react'
import { TasksProvider, useTasksContext } from './TasksContext'

function TestConsumer() {
  const { tasks, isLoading, hasLoaded } = useTasksContext()

  useEffect(() => {
    if (hasLoaded) {
      return
    }
  }, [hasLoaded])

  return (
    <div>
      <div>{isLoading ? 'loading' : 'loaded'}</div>
      <div>{tasks.length}</div>
    </div>
  )
}

describe('TasksProvider', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: vi
          .fn()
          .mockResolvedValue({ data: [{ id: '1', title: 'Test task' }] }),
      }),
    )
  })

  afterEach(() => {
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
    expect(screen.getByText('1')).toBeTruthy()
  })
})
