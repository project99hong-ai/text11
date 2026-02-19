'use client'

import { useMemo, useState } from 'react'
import { CAL_EVENTS, LAYER_LABELS, type Layer } from '../../lib/calendarEvents'
import { addMonths, getMonthGrid, isSameDay, toISODate } from '../../lib/date'
import LifeCalendar from '../calendar/LifeCalendar'
import {
  countEventsInMonth,
  isWeekend,
  mapEventsToDates,
} from '../../lib/calendarUtils'

const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const layerStyle: Record<Layer, { text: string; border: string; dot: string }> = {
  expo: {
    text: 'text-emerald-700',
    border: 'border-emerald-400/60',
    dot: 'bg-emerald-700/60',
  },
  hack: {
    text: 'text-violet-700',
    border: 'border-violet-400/60',
    dot: 'bg-violet-700/60',
  },
  stock: {
    text: 'text-amber-700',
    border: 'border-amber-400/60',
    dot: 'bg-amber-700/60',
  },
}

const layerEmoji: Record<Layer, string> = {
  expo: '🎨',
  hack: '💻',
  stock: '📈',
}

const importantTags = ['마감', '발표', '본선', '휴장', '동시만기', '거래정지', 'FOMC', '수출입', '주총시즌', '유의']

export default function Tap2Calendar() {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(toISODate(today))
  const [activeLayers, setActiveLayers] = useState<Set<Layer>>(
    new Set(['expo', 'hack', 'stock']),
  )

  const monthCells = useMemo(
    () => getMonthGrid(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate],
  )

  const eventsByDate = useMemo(() => {
    return mapEventsToDates(CAL_EVENTS, activeLayers)
  }, [activeLayers])

  const selectedEvents = useMemo(() => {
    return CAL_EVENTS.filter((event) =>
      activeLayers.has(event.layer) &&
      (event.date === selectedDate || (event.endDate && selectedDate >= event.date && selectedDate <= event.endDate)),
    )
  }, [selectedDate, activeLayers])

  const countsByLayer = useMemo(() => {
    return (Object.keys(LAYER_LABELS) as Layer[]).reduce((acc, layer) => {
      acc[layer] = countEventsInMonth(CAL_EVENTS, layer, viewDate.getFullYear(), viewDate.getMonth())
      return acc
    }, {} as Record<Layer, number>)
  }, [viewDate])

  const currentMonthLabel = `${viewDate.getFullYear()}년 ${viewDate.getMonth() + 1}월`

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-xl font-semibold tracking-tight text-ink">CALENDAR</h3>
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-ink/70">
          <button
            type="button"
            className="px-3 py-1.5 text-sm hover:underline"
            onClick={() => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))}
          >
            오늘
          </button>
          <button
            type="button"
            className="px-3 py-1.5 text-sm hover:underline"
            onClick={() => setViewDate((prev) => addMonths(prev, -1))}
          >
            ‹
          </button>
          <span>{currentMonthLabel}</span>
          <button
            type="button"
            className="px-3 py-1.5 text-sm hover:underline"
            onClick={() => setViewDate((prev) => addMonths(prev, 1))}
          >
            ›
          </button>
        </div>
      </div>

      <p className="mt-2 text-sm text-ink/60">Press the interest layers</p>

      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        {(Object.keys(LAYER_LABELS) as Layer[]).map((layer) => {
          const active = activeLayers.has(layer)
          return (
            <button
              key={layer}
              type="button"
              className={`flex items-center gap-2 border px-3 py-1.5 text-sm uppercase tracking-[0.2em] ${
                active
                  ? `${layerStyle[layer].text} ${layerStyle[layer].border} font-semibold`
                  : 'border-ink/20 text-ink/60'
              }`}
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
              <span>{layerEmoji[layer]}</span>
              <span>{LAYER_LABELS[layer]} ({countsByLayer[layer] ?? 0})</span>
              {active && <span className="text-xs">✓</span>}
            </button>
          )
        })}
      </div>

      <div className="mt-5 grid grid-cols-7 text-lg uppercase tracking-[0.2em] leading-tight text-ink/90">
        {weekdays.map((day, index) => (
          <div
            key={day}
            className={`pb-2 text-lg leading-tight ${index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-ink/90'}`}
            style={{ fontSize: '18px' }}
          >
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
          const weekend = isWeekend(cell.date)
          const dateNumberClass =
            cell.date.getDay() === 0
              ? 'text-red-600'
              : cell.date.getDay() === 6
                ? 'text-blue-600'
                : 'text-ink/90'

          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => setSelectedDate(cell.iso)}
              className={`group flex h-full min-h-[110px] flex-col items-start justify-start text-left text-base transition-colors duration-200 ${
                cell.inMonth ? 'text-ink/80 hover:text-ink' : 'text-ink/30'
              }`}
            >
              <span
                className={`relative flex h-7 w-7 items-center justify-center text-base font-medium leading-tight ${
                  isToday ? 'rounded-md border border-ink/40' : ''
                } ${weekend && cell.inMonth ? dateNumberClass : ''}`}
                style={{ fontSize: '16px' }}
              >
                {cell.date.getDate()}
              </span>
              {isSelected && (
                <span className="mt-1 h-[2px] w-6 bg-ink/40" />
              )}
              <div className="mt-2 flex w-full flex-col space-y-1 overflow-hidden">
                {important && (
                  <span
                    className={`text-[14px] font-medium leading-tight ${layerStyle[important.layer].text} line-clamp-2`}
                    style={{ fontSize: '14px' }}
                    title={important.title}
                  >
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
          <p className="text-sm uppercase tracking-[0.2em] text-ink/60">SELECTED DAY</p>
          <p className="mt-2 text-sm text-ink/70">{selectedDate}</p>
          <div className="mt-3 max-h-40 space-y-2 overflow-y-auto text-sm text-ink/70">
            {selectedEvents.length === 0 && <p className="text-ink/50">선택된 일정이 없습니다.</p>}
            {selectedEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-3">
                <span className={`text-sm ${layerStyle[event.layer].text}`}>
                  {LAYER_LABELS[event.layer]}
                </span>
                <span className="text-ink/80">{event.title}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="text-sm uppercase tracking-[0.2em] text-ink/60">LIFE CALENDAR</p>
          <div className="mt-3">
            <LifeCalendar />
          </div>
        </section>
      </div>
    </div>
  )
}
