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
}

const TasksContext = createContext<TasksContextValue | undefined>(undefined)

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

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
    }),
    [tasks, isLoading, errorMessage, hasLoaded, refreshTasks],
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
