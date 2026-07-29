import { useTasksContext } from '#/context/TasksContext'
import type { Task } from '#/types/task'
import { getDateString, getTimeOfDay } from '#/util/dateUtil'
import { Plus, Check, X } from 'lucide-react'
import { useState, useEffect, type FormEvent } from 'react'

export function Tasks() {
  const {
    tasks,
    setTasks,
    isLoading,
    errorMessage: contextErrorMessage,
    setErrorMessage,
    refreshTasks,
  } = useTasksContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    void refreshTasks()
  }, [refreshTasks])

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
      {contextErrorMessage ? (
        <p className="mt-2 text-sm text-red-400">{contextErrorMessage}</p>
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
        <div>
          <div className="grid min-h-[140px] w-full place-items-center overflow-x-scroll rounded-lg p-6 lg:overflow-visible">
            <svg
              className="text-gray-300 animate-spin"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
            >
              <path
                d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
                stroke="currentColor"
                stroke-width="5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <path
                d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
                stroke="currentColor"
                stroke-width="5"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="text-gray-900"
              ></path>
            </svg>
          </div>
        </div>
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
