export type IconTab = {
  id: string
  label: string
  emoji: string
  x: string
  y: string
}

export const iconTabs: IconTab[] = [
  { id: 'scan', label: 'Scan', emoji: '✍️', x: '10%', y: '28%' },
  { id: 'calendar', label: 'Calendar', emoji: '📅', x: '36%', y: '18%' },
  { id: 'community', label: 'Community', emoji: '🧩', x: '62%', y: '26%' },
  { id: 'supplements', label: 'Supplements', emoji: '💊', x: '78%', y: '12%' },
  { id: 'archive', label: 'Archive', emoji: '🗂️', x: '52%', y: '40%' },
]
