'use client'

import { useMemo, useState } from 'react'

type Mode = 'year-1' | 'years-100'
type CellSize = 6 | 8

const WEEKS_IN_YEAR = 52
const YEARS = 100
const CELL_GAP_PX = 1
const MS_IN_WEEK = 1000 * 60 * 60 * 24 * 7
const GRID_SCALE = 0.2

const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')

export default function LifeCalendar({ birthDate }: { birthDate?: string } = {}) {
  const [mode, setMode] = useState<Mode>('years-100')
  const [cellSize, setCellSize] = useState<CellSize>(6)
  const today = new Date()
  const birth = useMemo(() => {
    const parsed = new Date(birthDate ?? '2004-01-01')
    return Number.isNaN(parsed.getTime()) ? new Date('2004-01-01') : parsed
  }, [birthDate])

  const livedWeeks = useMemo(() => {
    const rawWeeks = Math.floor((today.getTime() - birth.getTime()) / MS_IN_WEEK)
    return Math.max(0, Math.min(rawWeeks, YEARS * WEEKS_IN_YEAR))
  }, [today, birth])
  const nowIndex = Math.max(0, livedWeeks - 1)

  const currentWeekOfYear = useMemo(() => {
    const startOfYear = new Date(today.getFullYear(), 0, 1)
    const days = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, Math.min(Math.floor(days / 7), WEEKS_IN_YEAR - 1))
  }, [today])

  const unscaledLifeWidth = WEEKS_IN_YEAR * cellSize + (WEEKS_IN_YEAR - 1) * CELL_GAP_PX
  const unscaledLifeHeight = YEARS * cellSize + (YEARS - 1) * CELL_GAP_PX
  const scaledLifeWidth = unscaledLifeWidth * GRID_SCALE
  const scaledLifeHeight = unscaledLifeHeight * GRID_SCALE

  const unscaledYearWidth = WEEKS_IN_YEAR * cellSize + (WEEKS_IN_YEAR - 1) * CELL_GAP_PX
  const scaledYearWidth = unscaledYearWidth * GRID_SCALE
  const scaledYearHeight = Math.max(cellSize * GRID_SCALE, 8)

  return (
    <div className="mt-3 mb-8 max-w-[520px]">
      <p className="text-sm uppercase tracking-[0.2em] text-ink/70">LIFE CALENDAR</p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-ink/50">Week Life</p>

      <div className="mt-3 flex items-center gap-5 text-sm uppercase tracking-[0.14em]">
        <button
          type="button"
          className={mode === 'years-100' ? 'font-semibold text-ink underline underline-offset-4' : 'text-ink/45'}
          onClick={() => setMode('years-100')}
        >
          {mode === 'years-100' ? '✓ 100 YEARS' : '100 YEARS'}
        </button>
        <button
          type="button"
          className={mode === 'year-1' ? 'font-semibold text-ink underline underline-offset-4' : 'text-ink/45'}
          onClick={() => setMode('year-1')}
        >
          {mode === 'year-1' ? '✓ 1 YEAR' : '1 YEAR'}
        </button>
      </div>

      <div className="mt-2 flex items-center gap-4 text-sm uppercase tracking-[0.12em]">
        <span className="text-ink/45">Density</span>
        <button
          type="button"
          className={cellSize === 6 ? 'font-semibold text-ink underline underline-offset-4' : 'text-ink/60'}
          onClick={() => setCellSize(6)}
        >
          {cellSize === 6 ? '✓ 6px' : '6px'}
        </button>
        <button
          type="button"
          className={cellSize === 8 ? 'font-semibold text-ink underline underline-offset-4' : 'text-ink/60'}
          onClick={() => setCellSize(8)}
        >
          {cellSize === 8 ? '✓ 8px' : '8px'}
        </button>
      </div>

      <div className="mt-3 hairline-dashed" />

      {mode === 'years-100' ? (
        <div className="mt-3">
          <div className="flex items-start gap-2">
            <div className="relative text-[9px] leading-none text-ink/55" style={{ width: 20, height: scaledLifeHeight }}>
              {Array.from({ length: YEARS + 1 }).map((_, age) => {
                if (age % 10 !== 0) return null
                const y = Math.min(age, YEARS - 1) * (cellSize + CELL_GAP_PX) * GRID_SCALE
                return (
                  <span key={`age-${age}`} className="absolute left-0 -translate-y-1/2">
                    {age}
                  </span>
                )
              })}
            </div>

            <div className="relative" style={{ width: scaledLifeWidth, height: scaledLifeHeight }}>
              <div
                className="absolute left-0 top-0"
                style={{
                  width: unscaledLifeWidth,
                  height: unscaledLifeHeight,
                  transform: `scale(${GRID_SCALE})`,
                  transformOrigin: 'top left',
                }}
              >
                <div
                  className="grid"
                  style={{
                    gridTemplateRows: `repeat(${YEARS}, ${cellSize}px)`,
                    rowGap: `${CELL_GAP_PX}px`,
                  }}
                >
                  {Array.from({ length: YEARS }).map((_, rowIndex) => (
                    <div
                      key={`life-row-${rowIndex}`}
                      className="relative grid"
                      style={{
                        gridTemplateColumns: `repeat(${WEEKS_IN_YEAR}, ${cellSize}px)`,
                        columnGap: `${CELL_GAP_PX}px`,
                      }}
                    >
                      {rowIndex > 0 && rowIndex % 10 === 0 && (
                        <span
                          className="pointer-events-none absolute left-0 right-0 top-0 h-px opacity-30"
                          style={{
                            backgroundImage:
                              'repeating-linear-gradient(90deg, rgba(27,27,27,0.45) 0, rgba(27,27,27,0.45) 4px, rgba(27,27,27,0) 4px, rgba(27,27,27,0) 8px)',
                          }}
                        />
                      )}
                      {Array.from({ length: WEEKS_IN_YEAR }).map((_, colIndex) => {
                        const index = rowIndex * WEEKS_IN_YEAR + colIndex
                        const filled = index < livedWeeks
                        const isNow = index === nowIndex
                        return (
                          <span
                            key={`life-cell-${index}`}
                            className={cn(
                              'relative block border border-ink/20',
                              filled ? 'bg-ink/35' : 'bg-transparent',
                            )}
                            style={{ width: cellSize, height: cellSize }}
                          >
                            {isNow && (
                              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] leading-none text-ink/70">
                                •
                              </span>
                            )}
                          </span>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div
            className="mt-2 grid grid-cols-4 text-[10px] uppercase tracking-[0.12em] text-ink/45"
            style={{ marginLeft: 22, width: scaledLifeWidth }}
          >
            <span>Q1</span>
            <span className="text-center">Q2</span>
            <span className="text-center">Q3</span>
            <span className="text-right">Q4</span>
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <div className="relative" style={{ width: scaledYearWidth, height: scaledYearHeight }}>
            <div
              className="absolute left-0 top-0 grid"
              style={{
                gridTemplateColumns: `repeat(${WEEKS_IN_YEAR}, ${cellSize}px)`,
                columnGap: `${CELL_GAP_PX}px`,
                transform: `scale(${GRID_SCALE})`,
                transformOrigin: 'top left',
              }}
            >
              {Array.from({ length: WEEKS_IN_YEAR }).map((_, weekIndex) => {
                const filled = weekIndex <= currentWeekOfYear
                const quarterStart = weekIndex === 13 || weekIndex === 26 || weekIndex === 39
                const isCurrent = weekIndex === currentWeekOfYear
                return (
                  <span key={`year-week-${weekIndex}`} className="relative">
                    <span
                      className={cn(
                        'block border border-ink/20',
                        filled ? 'bg-ink/35' : 'bg-transparent',
                      )}
                      style={{
                        width: cellSize,
                        height: cellSize,
                        borderLeft: quarterStart ? '1px dashed rgba(27,27,27,0.3)' : undefined,
                      }}
                    />
                    {isCurrent && (
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] leading-none text-ink/70">
                        •
                      </span>
                    )}
                  </span>
                )
              })}
            </div>
          </div>

          <div className="mt-2 grid grid-cols-4 text-[10px] uppercase tracking-[0.12em] text-ink/45" style={{ width: scaledYearWidth }}>
            <span>Q1</span>
            <span className="text-center">Q2</span>
            <span className="text-center">Q3</span>
            <span className="text-right">Q4</span>
          </div>
        </div>
      )}
    </div>
  )
}
