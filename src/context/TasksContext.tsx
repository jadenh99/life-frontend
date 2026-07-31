import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import { type Task } from '../types/task'

interface TasksContextValue {
  tasks: Task[]
  setTasks: Dispatch<SetStateAction<Task[]>>
  isLoading: boolean
  errorMessage: string | null
  setErrorMessage: Dispatch<SetStateAction<string | null>>
  hasLoaded: boolean
  refreshTasks: (force?: boolean) => Promise<void>
  addTask: (input: {
    title: string
    dueDate?: string | null
    priority?: Task['priority']
  }) => Promise<boolean>
  removeTask: (taskId: string) => Promise<void>
}

const TasksContext = createContext<TasksContextValue | undefined>(undefined)

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  const addTask = useCallback(
    async ({
      title,
      dueDate,
      priority = 'medium',
    }: {
      title: string
      dueDate?: string | null
      priority?: Task['priority']
    }) => {
      const trimmedTitle = title.trim()

      if (!trimmedTitle) {
        return false
      }

      const normalizedDueDate = dueDate
        ? new Date(`${dueDate}T12:00:00`).toISOString()
        : null

      const optimisticTask: Task = {
        id: `optimistic-${Date.now()}`,
        title: trimmedTitle,
        description: '',
        dueDate: normalizedDueDate,
        priority,
        completed: false,
        createdAt: new Date().toISOString(),
        pending: true,
      }

      setTasks((currentTasks) => [optimisticTask, ...currentTasks])
      setErrorMessage(null)

      try {
        const response = await fetch(
          'https://i17moo3023.execute-api.ap-southeast-2.amazonaws.com/tasks',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: trimmedTitle,
              dueDate: normalizedDueDate,
              priority,
            }),
          },
        )

        if (!response.ok) {
          throw new Error('Unable to create task right now.')
        }

        const savedTask = await response.json()

        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task.id === optimisticTask.id
              ? { ...savedTask, pending: false }
              : task,
          ),
        )

        return true
      } catch (error) {
        setTasks((currentTasks) =>
          currentTasks.filter((task) => task.id !== optimisticTask.id),
        )
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to create task right now.',
        )
        return false
      }
    },
    [],
  )

  const removeTask = useCallback(async (taskId: string) => {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId),
    )

    try {
      const response = await fetch(
        'https://i17moo3023.execute-api.ap-southeast-2.amazonaws.com/tasks',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            taskId,
          }),
        },
      )

      if (!response.ok) {
        throw new Error('Unable to remove task right now.')
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to remove task right now.',
      )
    }
  }, [])

  const refreshTasks = useCallback(
    async (force = false) => {
      if (!force && hasLoaded) {
        return
      }

      setIsLoading(true)

      try {
        const response = await fetch(
          'https://i17moo3023.execute-api.ap-southeast-2.amazonaws.com/tasks',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )

        const data = await response.json()
        setTasks(Array.isArray(data?.data) ? data.data : [])
        setErrorMessage(null)
      } catch (error) {
        setTasks([])
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to fetch tasks right now.',
        )
      } finally {
        setIsLoading(false)
        setHasLoaded(true)
      }
    },
    [hasLoaded],
  )

  useEffect(() => {
    if (!hasLoaded) {
      void refreshTasks()
    }
  }, [hasLoaded, refreshTasks])

  const value = useMemo<TasksContextValue>(
    () => ({
      tasks,
      setTasks,
      isLoading,
      errorMessage,
      setErrorMessage,
      hasLoaded,
      refreshTasks,
      addTask,
      removeTask,
    }),
    [
      tasks,
      isLoading,
      errorMessage,
      hasLoaded,
      refreshTasks,
      addTask,
      removeTask,
    ],
  )

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}

export function useTasksContext() {
  const context = useContext(TasksContext)

  if (!context) {
    throw new Error('useTasksContext must be used within a TasksProvider')
  }

  return context
}
