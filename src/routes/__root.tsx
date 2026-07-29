import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { useState } from 'react'

import appCss from '../styles.css?url'
import { Sprout, LayoutDashboard, SquareCheckBig } from 'lucide-react'
import { Home } from '../pages/index.page'
import { Tasks } from '../pages/tasks.page'
import { TasksProvider } from '../context/TasksContext'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Life Organiser',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const [activeView, setActiveView] = useState<'dashboard' | 'tasks'>(
    'dashboard',
  )
  const [isPulsing, setIsPulsing] = useState(false)

  function handleNavClick(view: 'dashboard' | 'tasks') {
    setActiveView(view)
    setIsPulsing(true)
    window.setTimeout(() => setIsPulsing(false), 180)
  }

  return (
    <html lang="en" className="bg-mist-950">
      <head>
        <HeadContent />
      </head>
      <body>
        <TasksProvider>
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] min-h-dvh pb-24 md:pb-0">
            <nav className="hidden md:flex bg-mist-900 w-50 p-4 border-r border-mist-800 min-h-dvh flex-col gap-2">
              <h2 className="flex items-center gap-2 px-2 py-1 rounded-sm text-2xl">
                <span>
                  <Sprout size={24} strokeWidth={10} stroke="green" />
                </span>
                Life
              </h2>
              <button
                type="button"
                onClick={() => setActiveView('dashboard')}
                className={`flex items-center gap-2 px-2 py-1 rounded-sm text-left transition-all duration-200 ${
                  activeView === 'dashboard'
                    ? 'bg-mist-700 text-white'
                    : 'text-mist-300 hover:bg-mist-500'
                }`}
              >
                <span>
                  <LayoutDashboard size={16} />
                </span>
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => setActiveView('tasks')}
                className={`flex items-center gap-2 px-2 py-1 rounded-sm text-left transition-all duration-200 ${
                  activeView === 'tasks'
                    ? 'bg-mist-700 text-white'
                    : 'text-mist-300 hover:bg-mist-500'
                }`}
              >
                <span>
                  <SquareCheckBig size={16} />
                </span>
                Tasks
              </button>
            </nav>

            <div className="flex-1 overflow-auto transition-all duration-300 ease-out">
              <div className="h-full transition-all duration-300 ease-out">
                {activeView === 'dashboard' ? <Home /> : <Tasks />}
              </div>
            </div>
          </div>

          <div className="fixed inset-x-0 bottom-4 z-40 md:hidden px-4 py-3 bg-mist-950">
            <div
              className={`relative mx-auto flex w-fit gap-4 items-center justify-between rounded-full border border-mist-800 bg-mist-900/95 px-2 py-2 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.8)] transition-transform duration-200 ${
                isPulsing ? 'scale-[1.05]' : 'scale-100'
              }`}
            >
              <div
                className={`absolute top-2 h-10 w-12 rounded-full bg-linear-to-br from-mist-500/80 to-cyan-400/80 shadow-lg shadow-blue-500/20 transition-all duration-300 ease-out ${
                  activeView === 'dashboard'
                    ? 'left-2'
                    : 'left-[calc(100%-56px)]'
                }`}
              />
              <button
                type="button"
                onClick={() => handleNavClick('dashboard')}
                className={`relative z-10 flex h-10 w-12 items-center justify-center rounded-full text-xs transition-colors duration-300 ${
                  activeView === 'dashboard' ? 'text-white' : 'text-mist-300'
                }`}
              >
                <LayoutDashboard size={18} />
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('tasks')}
                className={`relative z-10 flex h-10 w-12 items-center justify-center rounded-full text-xs transition-colors duration-300 ${
                  activeView === 'tasks' ? 'text-white' : 'text-mist-300'
                }`}
              >
                <SquareCheckBig size={18} />
              </button>
            </div>
          </div>

          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
          <Scripts />
        </TasksProvider>
      </body>
    </html>
  )
}
