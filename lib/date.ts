export type DayCell = {
  date: Date
  inMonth: boolean
  iso: string
}

const pad = (value: number) => String(value).padStart(2, '0')

export function toISODate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function getMonthGrid(year: number, monthIndex: number) {
  const first = new Date(year, monthIndex, 1)
  const start = new Date(first)
  start.setDate(first.getDate() - first.getDay())
  const cells: DayCell[] = []

  for (let i = 0; i < 42; i += 1) {
    const current = new Date(start)
    current.setDate(start.getDate() + i)
    cells.push({
      date: current,
      inMonth: current.getMonth() === monthIndex,
      iso: toISODate(current),
    })
  }

  return cells
}

export function addMonths(date: Date, delta: number) {
  const next = new Date(date)
  next.setMonth(next.getMonth() + delta)
  return next
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}
