import type { CalEvent, Layer } from './calendarEvents'

export type EventByDate = Map<string, CalEvent[]>

const pad = (value: number) => String(value).padStart(2, '0')

export function toISO(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function parseISO(value: string) {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function isWeekend(date: Date) {
  const day = date.getDay()
  return day === 0 || day === 6
}

export function expandRange(event: CalEvent) {
  if (!event.endDate) return [event.date]
  const dates: string[] = []
  let cursor = parseISO(event.date)
  const end = parseISO(event.endDate)
  while (cursor <= end) {
    dates.push(toISO(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return dates
}

export function mapEventsToDates(
  events: CalEvent[],
  activeLayers: Set<Layer>,
) {
  const map: EventByDate = new Map()
  events.forEach((event) => {
    if (!activeLayers.has(event.layer)) return
    const dates = expandRange(event)
    dates.forEach((iso, index) => {
      if (!map.has(iso)) map.set(iso, [])
      const list = map.get(iso) ?? []
      if (event.endDate && index > 0) {
        list.push({ ...event, tag: undefined })
      } else {
        list.push(event)
      }
      map.set(iso, list)
    })
  })
  return map
}

export function countEventsInMonth(
  events: CalEvent[],
  layer: Layer,
  year: number,
  monthIndex: number,
) {
  const start = new Date(year, monthIndex, 1)
  const end = new Date(year, monthIndex + 1, 0)
  return events.filter((event) => {
    if (event.layer !== layer) return false
    const startDate = parseISO(event.date)
    const endDate = event.endDate ? parseISO(event.endDate) : startDate
    return startDate <= end && endDate >= start
  }).length
}
