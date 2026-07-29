import { getDateString, getTimeOfDay } from '#/util/dateUtil'

export function Home() {
  return (
    <div className="p-8">
      <span className="opacity-80">{getDateString()}</span>
      <h1 className="text-4xl font-bold">Good {getTimeOfDay()}, Jaden</h1>
      <div className="mt-8">You should have a look at your tasks today.</div>
    </div>
  )
}
