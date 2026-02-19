'use client'

import { useEffect, useMemo, useState } from 'react'
import { CAL_EVENTS, LAYER_LABELS, type CalEvent, type Layer } from '../../lib/calendarEvents'
import { addMonths, getMonthGrid, isSameDay, toISODate } from '../../lib/date'
import LifeCalendar from '../calendar/LifeCalendar'
import { countEventsInMonth, mapEventsToDates } from '../../lib/calendarUtils'

const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const weekdaysKo = ['일', '월', '화', '수', '목', '금', '토']

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

const layerOrder: Layer[] = ['hack', 'expo', 'stock']
type AnchorRect = { left: number; top: number; width: number; height: number }

const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')

const getWeekdayKo = (isoDate: string) => {
  const day = new Date(`${isoDate}T00:00:00`).getDay()
  return weekdaysKo[day] ?? ''
}

const formatCellLabel = (event: CalEvent) => {
  const tagPrefix = event.tag ? `(${event.tag}) ` : ''
  return `${layerEmoji[event.layer]} ${tagPrefix}${event.title}`
}

const sortByImportance = (events: CalEvent[]) =>
  [...events].sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0))

function FocusPopover({
  focusDate,
  anchorRect,
  groupedFocusEvents,
  onClose,
}: {
  focusDate: string
  anchorRect: AnchorRect
  groupedFocusEvents: Record<Layer, CalEvent[]>
  onClose: () => void
}) {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
  const vh = typeof window !== 'undefined' ? window.innerHeight : 900
  const maxWidth = Math.min(420, vw - 32)
  const maxHeight = Math.min(Math.floor(vh * 0.45), vh - 24)

  let x = anchorRect.left + anchorRect.width + 12
  let y = anchorRect.top

  if (x + maxWidth > vw - 12) {
    x = anchorRect.left - maxWidth - 12
  }
  if (y + maxHeight > vh - 12) {
    y = vh - maxHeight - 12
  }
  if (y < 12) y = 12
  if (x < 12) x = 12

  return (
    <>
      <button
        type="button"
        aria-label="close-backdrop"
        className="fixed inset-0 z-40 bg-black/5"
        onClick={onClose}
      />
      <div
        className="fixed z-50 border border-ink/25 bg-[#fbfbf8] p-6"
        style={{
          left: x,
          top: y,
          width: maxWidth,
          maxWidth: 'min(420px, calc(100vw - 32px))',
          maxHeight,
          overflowY: 'auto',
          animation: 'content-fade 180ms ease-out both',
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <p className="text-lg text-ink">
            {focusDate} ({getWeekdayKo(focusDate)})
          </p>
          <button
            type="button"
            className="text-sm uppercase tracking-[0.12em] text-ink/70 hover:underline"
            onClick={onClose}
          >
            닫기
          </button>
        </div>

        <div className="mt-4 space-y-5">
          {layerOrder.map((layer) => {
            const list = groupedFocusEvents[layer]
            if (!list || list.length === 0) return null
            return (
              <section key={`focus-${layer}`}>
                <p className={cn('text-sm uppercase tracking-[0.12em]', layerStyle[layer].text)}>
                  {layerEmoji[layer]} {LAYER_LABELS[layer]}
                </p>
                <ul className="mt-2 space-y-2">
                  {list.map((event) => (
                    <li key={event.id} className="text-[15px] leading-relaxed text-ink/85">
                      <span>• {event.title}</span>
                      {event.tag && (
                        <span className="ml-2 text-ink/55">({event.tag})</span>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 hairline-dashed" />
              </section>
            )
          })}

          {layerOrder.every((layer) => groupedFocusEvents[layer].length === 0) && (
            <p className="text-sm text-ink/55">선택한 날짜에 표시할 일정이 없습니다.</p>
          )}
        </div>
      </div>
    </>
  )
}

export default function Tap2Calendar() {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(toISODate(today))
  const [focusDate, setFocusDate] = useState<string | null>(null)
  const [anchorRect, setAnchorRect] = useState<AnchorRect | null>(null)
  const [activeLayers, setActiveLayers] = useState<Set<Layer>>(new Set(['expo', 'hack', 'stock']))

  const monthCells = useMemo(
    () => getMonthGrid(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate],
  )

  const eventsByDate = useMemo(() => mapEventsToDates(CAL_EVENTS, activeLayers), [activeLayers])

  const focusEvents = useMemo(() => {
    if (!focusDate) return []
    return sortByImportance(eventsByDate.get(focusDate) ?? [])
  }, [eventsByDate, focusDate])

  const groupedFocusEvents = useMemo(() => {
    return layerOrder.reduce((acc, layer) => {
      acc[layer] = focusEvents.filter((event) => event.layer === layer)
      return acc
    }, {} as Record<Layer, CalEvent[]>)
  }, [focusEvents])

  const countsByLayer = useMemo(() => {
    return (Object.keys(LAYER_LABELS) as Layer[]).reduce((acc, layer) => {
      acc[layer] = countEventsInMonth(CAL_EVENTS, layer, viewDate.getFullYear(), viewDate.getMonth())
      return acc
    }, {} as Record<Layer, number>)
  }, [viewDate])

  const currentMonthLabel = `${viewDate.getFullYear()}년 ${viewDate.getMonth() + 1}월`

  useEffect(() => {
    if (!focusDate) return
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFocusDate(null)
        setAnchorRect(null)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [focusDate])

  const closeFocus = () => {
    setFocusDate(null)
    setAnchorRect(null)
  }

  return (
    <div>
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6 md:px-8 mt-8 mb-12">
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
                className={`flex items-center gap-2 border px-3 py-1.5 text-sm uppercase tracking-[0.1em] ${
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
                {active && <span className="text-base">✓</span>}
              </button>
            )
          })}
        </div>

        <div className="mt-5 grid grid-cols-7 text-base">
          {weekdays.map((day, colIndex) => (
            <div
              key={day}
              className={cn(
                'pb-2 text-[18px] leading-none uppercase tracking-[0.08em]',
                colIndex === 0 ? '!text-red-600' : colIndex === 6 ? '!text-blue-600' : 'text-ink/80',
              )}
            >
              {day}
            </div>
          ))}
        </div>
        <div className="hairline-dashed" />

        <div className="mt-4 grid grid-cols-7 gap-y-4 text-base" style={{ minHeight: '70vh' }}>
          {monthCells.map((cell) => {
            const isToday = isSameDay(cell.date, today)
            const isSelected = cell.iso === selectedDate
            const dayEvents = sortByImportance(eventsByDate.get(cell.iso) ?? [])
            const visibleEvents = dayEvents.slice(0, 2)
            const moreCount = Math.max(0, dayEvents.length - visibleEvents.length)
            const cellColIndex = cell.date.getDay()
            const dateNumberColorClass =
              cellColIndex === 0
                ? '!text-red-600'
                : cellColIndex === 6
                  ? '!text-blue-600'
                  : 'text-ink/90'

            return (
              <button
                key={cell.iso}
                type="button"
                onClick={(e) => {
                  setSelectedDate(cell.iso)
                  setFocusDate(cell.iso)
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                  setAnchorRect({
                    left: rect.left,
                    top: rect.top,
                    width: rect.width,
                    height: rect.height,
                  })
                }}
                className={cn(
                  'group flex h-full min-h-[110px] sm:min-h-[90px] flex-col items-start justify-start text-left transition-colors duration-200',
                  cell.inMonth ? 'text-ink/80 hover:text-ink' : 'text-ink/30',
                )}
              >
                <span
                  className={cn(
                    'relative mt-1 flex h-8 w-8 items-center justify-center text-[16px] font-medium',
                    dateNumberColorClass,
                    isToday && 'rounded-md border border-ink/40',
                  )}
                >
                  {cell.date.getDate()}
                </span>
                {isSelected && (
                  <span className="mt-1 h-[2px] w-6 bg-ink/40" />
                )}
                <div className="mt-1.5 flex w-full flex-col space-y-1 overflow-hidden">
                  {visibleEvents.map((event) => (
                    <span
                      key={event.id}
                      className={cn('text-[14px] leading-tight truncate', layerStyle[event.layer].text)}
                      title={formatCellLabel(event)}
                    >
                      {formatCellLabel(event)}
                    </span>
                  ))}
                  {moreCount > 0 && (
                    <span className="text-[12px] leading-tight text-ink/60">+{moreCount} more</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <section>
            <p className="text-sm text-ink/70">날짜를 클릭하면 셀 근처에 상세 일정이 뜹니다.</p>
          </section>
          <section>
            <p className="text-sm uppercase tracking-[0.2em] text-ink/60">LIFE CALENDAR</p>
            <div className="mt-3">
              <LifeCalendar />
            </div>
          </section>
        </div>
      </div>

      {focusDate && anchorRect && (
        <FocusPopover
          focusDate={focusDate}
          anchorRect={anchorRect}
          groupedFocusEvents={groupedFocusEvents}
          onClose={closeFocus}
        />
      )}
    </div>
  )
}
