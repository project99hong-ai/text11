'use client'

import { useMemo, useState } from 'react'
import { CAL_EVENTS, LAYER_LABELS, type Layer } from '../../lib/calendarEvents'
import { addMonths, getMonthGrid, isSameDay, toISODate } from '../../lib/date'
import LifeCalendar from '../calendar/LifeCalendar'

const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

type LayerStyle = {
  dot: string
  label: string
}

const layerStyle: Record<Layer, LayerStyle> = {
  expo: { dot: 'bg-ink/35', label: 'text-ink/60' },
  hackathon: { dot: 'bg-ink/50', label: 'text-ink/70' },
  stock: { dot: 'bg-accent/70', label: 'text-accent' },
}

const importantTags = ['마감', '발표', '본선', '휴장', '동시만기']

export default function Tap2Calendar() {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(toISODate(today))
  const [activeLayers, setActiveLayers] = useState<Set<Layer>>(
    new Set(['expo', 'hackathon', 'stock']),
  )

  const monthCells = useMemo(
    () => getMonthGrid(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate],
  )

  const monthKey = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}`

  const eventsByDate = useMemo(() => {
    const map = new Map<string, typeof CAL_EVENTS>()
    CAL_EVENTS.forEach((event) => {
      if (!activeLayers.has(event.layer)) return
      if (!event.date.startsWith(monthKey)) return
      if (!map.has(event.date)) map.set(event.date, [])
      map.get(event.date)?.push(event)
    })
    return map
  }, [activeLayers, monthKey])

  const selectedEvents = useMemo(() => {
    return CAL_EVENTS.filter(
      (event) => activeLayers.has(event.layer) && event.date === selectedDate,
    ).slice(0, 5)
  }, [selectedDate, activeLayers])

  const currentMonthLabel = `${viewDate.getFullYear()}년 ${viewDate.getMonth() + 1}월`

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-xl font-semibold tracking-tight text-ink">CALENDAR</h3>
        <div className="flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-ink/70">
          <button
            type="button"
            className="hover:underline"
            onClick={() => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))}
          >
            오늘
          </button>
          <button
            type="button"
            className="hover:underline"
            onClick={() => setViewDate((prev) => addMonths(prev, -1))}
          >
            ‹
          </button>
          <span>{currentMonthLabel}</span>
          <button
            type="button"
            className="hover:underline"
            onClick={() => setViewDate((prev) => addMonths(prev, 1))}
          >
            ›
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-4 text-xs uppercase tracking-[0.2em]">
        {(Object.keys(LAYER_LABELS) as Layer[]).map((layer) => {
          const active = activeLayers.has(layer)
          return (
            <button
              key={layer}
              type="button"
              className={`flex items-center gap-2 ${active ? 'text-ink' : 'text-ink/40'}`}
              onClick={() => {
                setActiveLayers((prev) => {
                  const next = new Set(prev)
                  if (next.has(layer)) {
                    next.delete(layer)
                  } else {
                    next.add(layer)
                  }
                  return next
                })
              }}
            >
              <span className="text-xs uppercase tracking-[0.2em]">
                {LAYER_LABELS[layer]}
              </span>
              {active && <span className="text-xs">✓</span>}
            </button>
          )
        })}
      </div>

      <div className="mt-5 grid grid-cols-7 text-xs uppercase tracking-[0.2em] text-ink/60">
        {weekdays.map((day) => (
          <div key={day} className="pb-2">
            {day}
          </div>
        ))}
      </div>
      <div className="hairline-dashed" />

      <div className="mt-4 grid grid-cols-7 gap-y-4" style={{ minHeight: '70vh' }}>
        {monthCells.map((cell) => {
          const isToday = isSameDay(cell.date, today)
          const isSelected = cell.iso === selectedDate
          const dayEvents = eventsByDate.get(cell.iso) ?? []
          const important = dayEvents.find((event) => event.tag && importantTags.includes(event.tag))
          const dots = dayEvents.filter((event) => !event.tag).slice(0, 3)

          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => setSelectedDate(cell.iso)}
              className={`group flex h-full min-h-[96px] flex-col items-start justify-start text-left text-sm transition-colors duration-200 ${
                cell.inMonth ? 'text-ink/80 hover:text-ink' : 'text-ink/30'
              }`}
            >
              <span
                className={`relative flex h-7 w-7 items-center justify-center text-xs ${
                  isToday ? 'rounded-md border border-ink/40' : ''
                }`}
              >
                {cell.date.getDate()}
              </span>
              {isSelected && (
                <span className="mt-1 h-[2px] w-5 bg-ink/40" />
              )}
              <div className="mt-2 flex flex-col gap-1">
                {important && (
                  <span className={`text-[10px] uppercase tracking-[0.18em] ${layerStyle[important.layer].label}`}>
                    {important.tag}
                  </span>
                )}
                <div className="flex items-center gap-1">
                  {dots.map((event) => (
                    <span
                      key={event.id}
                      className={`h-1.5 w-1.5 rounded-full ${layerStyle[event.layer].dot}`}
                    />
                  ))}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section>
          <p className="text-xs uppercase tracking-[0.2em] text-ink/60">SELECTED DAY</p>
          <p className="mt-2 text-sm text-ink/70">{selectedDate}</p>
          <div className="mt-3 space-y-2 text-sm text-ink/70">
            {selectedEvents.length === 0 && <p className="text-ink/50">선택된 일정이 없습니다.</p>}
            {selectedEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-3">
                <span className={`text-xs ${layerStyle[event.layer].label}`}>
                  {LAYER_LABELS[event.layer]}
                </span>
                <span className="text-ink/80">{event.title}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="text-xs uppercase tracking-[0.2em] text-ink/60">LIFE CALENDAR</p>
          <div className="mt-3">
            <LifeCalendar />
          </div>
        </section>
      </div>
    </div>
  )
}
