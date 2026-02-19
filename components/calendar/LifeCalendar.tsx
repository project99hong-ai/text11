'use client'

import { useMemo } from 'react'

const WEEKS = 52
const DAYS = 7
const TOTAL_CELLS = WEEKS * DAYS // 364
const CELL_SIZE = 10
const CELL_GAP = 2
const GRID_SCALE = 0.86
const DAY_MS = 1000 * 60 * 60 * 24
const QUARTER_GUIDES = [13, 26, 39]

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const parseStartDate = (startDate?: string, today?: Date) => {
  if (startDate) {
    const parsed = new Date(startDate)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }
  const base = today ?? new Date()
  return new Date(base.getFullYear(), 0, 1)
}

export default function LifeCalendar({ startDate }: { startDate?: string } = {}) {
  const today = new Date()

  const start = useMemo(() => parseStartDate(startDate, today), [startDate, today])

  const dayIndex = useMemo(() => {
    return Math.floor((today.getTime() - start.getTime()) / DAY_MS)
  }, [today, start])

  const filledCount = clamp(dayIndex + 1, 0, TOTAL_CELLS)
  const todayCellIndex = clamp(dayIndex, 0, TOTAL_CELLS - 1)

  const unscaledWidth = WEEKS * CELL_SIZE + (WEEKS - 1) * CELL_GAP
  const unscaledHeight = DAYS * CELL_SIZE + (DAYS - 1) * CELL_GAP
  const scaledWidth = unscaledWidth * GRID_SCALE
  const scaledHeight = unscaledHeight * GRID_SCALE

  return (
    <div className="mt-3 mb-10 max-w-[560px]">
      <p className="text-sm uppercase tracking-[0.16em] text-ink/70">LIFE CALENDAR</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-ink/60">YEAR (52×7)</p>

      <div className="mt-3">
        <div className="relative" style={{ width: scaledWidth, height: scaledHeight }}>
          <div
            className="absolute left-0 top-0"
            style={{
              transform: `scale(${GRID_SCALE})`,
              transformOrigin: 'top left',
            }}
          >
            <div
              className="relative grid"
              style={{
                width: unscaledWidth,
                height: unscaledHeight,
                gridTemplateColumns: `repeat(${WEEKS}, ${CELL_SIZE}px)`,
                gridTemplateRows: `repeat(${DAYS}, ${CELL_SIZE}px)`,
                columnGap: `${CELL_GAP}px`,
                rowGap: `${CELL_GAP}px`,
              }}
            >
              {QUARTER_GUIDES.map((week) => {
                const left = week * CELL_SIZE + (week - 1) * CELL_GAP + CELL_GAP / 2
                return (
                  <span
                    key={`q-guide-${week}`}
                    className="pointer-events-none absolute top-0 bottom-0 w-px opacity-35"
                    style={{
                      left,
                      backgroundImage:
                        'repeating-linear-gradient(180deg, rgba(27,27,27,0.45) 0, rgba(27,27,27,0.45) 4px, rgba(27,27,27,0) 4px, rgba(27,27,27,0) 8px)',
                    }}
                  />
                )
              })}
              {Array.from({ length: DAYS }).map((_, dayInWeek) =>
                Array.from({ length: WEEKS }).map((__, weekIndex) => {
                  const cellIndex = weekIndex * DAYS + dayInWeek
                  const filled = cellIndex < filledCount
                  const isToday = cellIndex === todayCellIndex

                  return (
                    <span
                      key={`cell-${dayInWeek}-${weekIndex}`}
                      className={`relative block border ${
                        isToday ? 'border-ink/60' : filled ? 'border-ink/35' : 'border-ink/12'
                      }`}
                      style={{
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        backgroundImage: filled
                          ? 'linear-gradient(135deg, transparent 47%, rgba(27,27,27,0.55) 48%, rgba(27,27,27,0.55) 52%, transparent 53%)'
                          : undefined,
                      }}
                    >
                      {filled && (
                        <span
                          className={`absolute right-[1px] top-[1px] block ${isToday ? 'bg-ink/80' : 'bg-ink/60'}`}
                          style={{ width: 2, height: 2 }}
                        />
                      )}
                    </span>
                  )
                }),
              )}
            </div>
          </div>
        </div>

        <div
          className="mt-2 grid text-[10px] uppercase tracking-[0.12em] text-ink/55"
          style={{ gridTemplateColumns: 'repeat(4, 1fr)', width: scaledWidth }}
        >
          <span>Q1</span>
          <span className="text-center">Q2</span>
          <span className="text-center">Q3</span>
          <span className="text-right">Q4</span>
        </div>
      </div>
    </div>
  )
}
