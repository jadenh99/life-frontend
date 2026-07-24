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
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="grid grid-cols-[auto_1fr] min-h-dvh">
          <nav className="bg-mist-900 w-50 p-4 border-r border-mist-800 min-h-dvh flex flex-col gap-2">
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
