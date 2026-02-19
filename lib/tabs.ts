export type TabId = 'calendar' | 'supplements' | 'scan' | 'community' | 'archive'

export type TabDef = {
  id: TabId
  label: string
  emoji: string
  implemented: boolean
}

export const TABS: TabDef[] = [
  { id: 'calendar', label: 'Calendar', emoji: '📅', implemented: true },
  { id: 'supplements', label: 'Supplements', emoji: '💊', implemented: true },
  { id: 'scan', label: 'Scan', emoji: '📋', implemented: false },
  { id: 'community', label: 'Community', emoji: '🧑‍🤝‍🧑', implemented: false },
  { id: 'archive', label: 'Archive', emoji: '🗂️', implemented: false },
]
