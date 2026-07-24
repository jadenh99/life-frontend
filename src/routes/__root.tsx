import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import appCss from '../styles.css?url'
import { Sprout, LayoutDashboard, SquareCheckBig } from 'lucide-react'

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
  return (
    <html lang="en" className="bg-mist-950">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] min-h-dvh pb-24 md:pb-0">
          <nav className="hidden md:flex bg-mist-900 w-50 p-4 border-r border-mist-800 min-h-dvh flex-col gap-2">
            <h2 className="flex items-center gap-2 px-2 py-1 rounded-sm text-2xl">
              <span>
                <Sprout size={24} strokeWidth={10} stroke="green" />
              </span>
              Life
            </h2>
            <h2 className="flex items-center gap-2 px-2 py-1 hover:bg-mist-500 transition-all duration-200 cursor-pointer rounded-sm">
              <span>
                <LayoutDashboard size={16} />
              </span>
              <Link to="/">Dashboard</Link>
            </h2>
            <h2 className="flex items-center gap-2 px-2 py-1 hover:bg-mist-500 transition-all duration-200 cursor-pointer rounded-sm">
              <span>
                <SquareCheckBig size={16} />
              </span>
              <Link to="/tasks">Tasks</Link>
            </h2>
          </nav>

          {children}
        </div>

        <div className="fixed inset-x-0 bottom-0 z-40 md:hidden px-4 py-3 bg-mist-950">
          <div className="mx-auto flex w-fit gap-8 px-8 max-w-lg items-center justify-around rounded-full border border-mist-800 bg-mist-900/95 py-3 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.8)]">
            <Link
              to="/"
              className="flex flex-col items-center gap-1 rounded-3xl text-xs text-mist-300 transition hover:bg-mist-800/70"
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/tasks"
              className="flex flex-col items-center gap-1 rounded-3xl text-xs text-mist-300 transition hover:bg-mist-800/70"
            >
              <SquareCheckBig size={16} />
              <span>Tasks</span>
            </Link>
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
      </body>
    </html>
  )
}
