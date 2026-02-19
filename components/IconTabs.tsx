'use client'

import { iconTabs } from '../lib/taps'

type IconTabsProps = {
  activeId: string | null
  onSelect: (id: string) => void
}

export default function IconTabs({ activeId, onSelect }: IconTabsProps) {
  return (
    <div className="relative h-[52vh] w-full">
      {iconTabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onSelect(tab.id)}
          className="group absolute select-none text-4xl md:text-5xl transition-transform duration-300 ease-soft hover:-translate-y-1"
          style={{ left: tab.x, top: tab.y }}
          aria-pressed={activeId === tab.id}
        >
          <span className="relative inline-flex items-center justify-center">
            <span className="drop-shadow-sm">{tab.emoji}</span>
            <span
              className={`pointer-events-none absolute -bottom-2 left-1/2 h-[2px] w-10 -translate-x-1/2 transition-opacity duration-300 ease-soft ${
                activeId === tab.id ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                background:
                  'linear-gradient(90deg, rgba(27,27,27,0), rgba(27,27,27,0.7), rgba(27,27,27,0))',
              }}
            />
          </span>
        </button>
      ))}
    </div>
  )
}
