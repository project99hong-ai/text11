'use client'

import { TABS, type TabId } from '../lib/tabs'

const TAB_POSITIONS: Record<TabId, { x: string; y: string }> = {
  scan: { x: '10%', y: '28%' },
  calendar: { x: '36%', y: '18%' },
  community: { x: '62%', y: '26%' },
  supplements: { x: '78%', y: '12%' },
  archive: { x: '52%', y: '40%' },
}

type IconTabsProps = {
  activeId: string | null
  onSelect: (id: TabId) => void
}

export default function IconTabs({ activeId, onSelect }: IconTabsProps) {
  return (
    <div className="relative h-[52vh] w-full">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onSelect(tab.id)}
          className="group absolute select-none text-4xl md:text-5xl transition-transform duration-300 ease-soft hover:-translate-y-1"
          style={{ left: TAB_POSITIONS[tab.id].x, top: TAB_POSITIONS[tab.id].y }}
          aria-label={tab.label}
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
