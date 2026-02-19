'use client'

import { useMemo, useState } from 'react'

type Mode = 'year' | 'life'

export default function LifeCalendar() {
  const [mode, setMode] = useState<Mode>('year')
  const [age, setAge] = useState(27)

  const today = new Date()
  const dayOfYear = useMemo(() => {
    const start = new Date(today.getFullYear(), 0, 1)
    const diff = today.getTime() - start.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1
  }, [today])

  const weeks = 52
  const days = 7

  return (
    <div>
      <div className="flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-ink/60">
        <button
          type="button"
          className={`text-xs uppercase tracking-[0.2em] ${mode === 'year' ? 'text-ink' : 'text-ink/40'}`}
          onClick={() => setMode('year')}
        >
          YEAR
        </button>
        <button
          type="button"
          className={`text-xs uppercase tracking-[0.2em] ${mode === 'life' ? 'text-ink' : 'text-ink/40'}`}
          onClick={() => setMode('life')}
        >
          LIFE(100Y)
        </button>
      </div>

      {mode === 'year' ? (
        <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: `auto repeat(${weeks}, minmax(0, 1fr))` }}>
          {Array.from({ length: weeks }).map((_, weekIndex) => (
            <div key={`label-${weekIndex}`} className="text-[10px] text-ink/40">
              {weekIndex % 4 === 0 ? weekIndex + 1 : ''}
            </div>
          ))}
          {Array.from({ length: days }).map((_, dayIndex) => (
            <div key={`day-${dayIndex}`} className="grid" style={{ gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))` }}>
              {Array.from({ length: weeks }).map((_, weekIndex) => {
                const index = weekIndex * days + dayIndex + 1
                const filled = index <= dayOfYear
                return (
                  <span
                    key={`${dayIndex}-${weekIndex}`}
                    className={`h-2.5 w-2.5 ${
                      filled ? 'border border-ink/60' : 'border border-ink/20'
                    }`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <div className="flex items-center gap-3 text-sm text-ink/70">
            <input
              type="range"
              min={0}
              max={99}
              value={age}
              onChange={(event) => setAge(Number(event.target.value))}
              className="w-full"
            />
            <span className="tabular-nums">{age}</span>
          </div>
          <div className="mt-4 grid grid-cols-10 gap-1">
            {Array.from({ length: 100 }).map((_, index) => {
              const active = index < age
              return (
                <span
                  key={index}
                  className={`h-2.5 w-2.5 ${
                    active ? 'border border-accent/70' : 'border border-ink/20'
                  }`}
                />
              )
            })}
          </div>
          <p className="mt-3 text-xs text-ink/60">
            남은 년: {100 - age} · 남은 주(근사): {(100 - age) * 52}
          </p>
        </div>
      )}
    </div>
  )
}
