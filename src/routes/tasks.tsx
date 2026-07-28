import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'
import { type Task } from '../types/task'
import { getDateString, getTimeOfDay } from '#/util/dateUtil'
import { Check, Plus, X } from 'lucide-react'

export const Route = createFileRoute('/tasks')({ component: Tasks })

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getTasks()
  }, [])

  async function getTasks() {
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
    setIsLoading(false)
  }

  async function addTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const title = String(formData.get('title') ?? '').trim()
    const dueDateValue = String(formData.get('dueDate') ?? '').trim()
    const priority = String(formData.get('priority') ?? 'medium').trim()

    if (!title) {
      return
    }

    const dueDate = dueDateValue
      ? new Date(`${dueDateValue}T12:00:00`).toISOString()
      : null

    const optimisticTask: Task = {
      id: `optimistic-${Date.now()}`,
      title,
      description: '',
      dueDate,
      priority: priority as Task['priority'],
      completed: false,
      createdAt: new Date().toISOString(),
      pending: true,
    }

    setTasks((currentTasks) => [optimisticTask, ...currentTasks])
    setErrorMessage(null)
    setIsSubmitting(true)
    e.currentTarget.reset()

    try {
      const response = await fetch(
        'https://i17moo3023.execute-api.ap-southeast-2.amazonaws.com/tasks',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            dueDate,
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
      setIsAddModalOpen(false)
    } catch (error) {
      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== optimisticTask.id),
      )
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to create task right now.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function removeTask(taskId: string) {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId),
    )
    await fetch(
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
  }

  function formatDueDate(dueDate?: string | null) {
    if (!dueDate) {
      return null
    }

    const parsedDate = new Date(dueDate)

    if (Number.isNaN(parsedDate.getTime())) {
      return null
    }

    return parsedDate.toLocaleDateString('en-AU', {
      timeZone: 'Australia/Sydney',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="bg-mist-950 p-8">
      <span className="opacity-80">{getDateString()}</span>
      <h1 className="text-4xl font-bold">Good {getTimeOfDay()}, Jaden</h1>
      {errorMessage ? (
        <p className="mt-2 text-sm text-red-400">{errorMessage}</p>
      ) : null}

      <div className="mt-4 mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-mist-400 bg-mist-500/10 text-mist-300 transition hover:bg-blue-500/20"
          aria-label="Add task"
        >
          <Plus size={20} />
        </button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <ul className="flex flex-col gap-4">
          {tasks.map((task) => (
            <li key={task.id}>
              <div
                className="border px-4 py-4 border-mist-800 justify-between clamp w-full md:w-1/2 grid grid-cols-1 grid-rows-2 md:grid-cols-3 md:grid-cols-[1fr, min-content, 1fr]
                group hover:bg-mist-800 transition-all duration-200 cursor-pointer rounded-md bg-mist-900 align-middle items-center"
              >
                <div className="row-start-1">
                  <h2 className="self-center">{task.title}</h2>
                  {task.dueDate ? (
                    <p className="mt-1 text-sm text-gray-400">
                      Due {formatDueDate(task.dueDate)}
                    </p>
                  ) : null}
                </div>
                {task.priority ? (
                  <span
                    className={`row-start-1 rounded-full px-2.5 py-1 text-xs font-medium capitalize h-min w-min justify-self-end ${
                      task.priority === 'high'
                        ? 'bg-red-500/15 text-red-300'
                        : task.priority === 'medium'
                          ? 'bg-amber-500/15 text-amber-300'
                          : 'bg-emerald-500/15 text-emerald-300'
                    }`}
                  >
                    {task.priority}
                  </span>
                ) : null}

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 justify-end">
                  <button
                    className="border p-2 rounded-full cursor-pointer border-green-400 h-fit self-center"
                    onClick={() => removeTask(task.id)}
                  >
                    <Check size={16} className="text-green-400" />
                  </button>
                  <button
                    className="border p-2 rounded-full cursor-pointer border-red-400 h-fit self-center"
                    onClick={() => removeTask(task.id)}
                  >
                    <X size={16} className="text-red-400" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {isAddModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            className="w-full max-w-md rounded-lg border border-mist-800 bg-mist-900 p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-task-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 id="add-task-title" className="text-xl font-semibold">
                Add a task
              </h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-full p-2 text-gray-400 transition hover:bg-mist-800 hover:text-white"
                aria-label="Close add task modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={addTask} className="space-y-4">
              <label
                className="block text-sm text-gray-300"
                htmlFor="task-title"
              >
                Task title
              </label>
              <input
                id="task-title"
                type="text"
                name="title"
                placeholder="Enter a task"
                disabled={isSubmitting}
                className="w-full rounded-sm border border-gray-600 bg-mist-800 p-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <label
                  className="block text-sm text-gray-300"
                  htmlFor="task-due-date"
                >
                  <span className="mb-1 block">Due date</span>
                  <input
                    id="task-due-date"
                    type="date"
                    name="dueDate"
                    disabled={isSubmitting}
                    className="w-full rounded-sm border border-gray-600 bg-mist-800 p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </label>

                <label
                  className="block text-sm text-gray-300"
                  htmlFor="task-priority"
                >
                  <span className="mb-1 block">Priority</span>
                  <select
                    id="task-priority"
                    name="priority"
                    defaultValue="medium"
                    disabled={isSubmitting}
                    className="w-full rounded-sm border border-gray-600 bg-mist-800 p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-sm border border-gray-600 px-4 py-2 text-sm text-gray-300 transition hover:bg-mist-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-sm bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Adding...' : 'Add task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
