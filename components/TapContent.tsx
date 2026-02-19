import { TABS } from '../lib/tabs'
import Tap2Calendar from './taps/Tap2Calendar'
import Tap4Supplements from './taps/Tap4Supplements'
import DevPlaceholder from './DevPlaceholder'

type TapContentProps = {
  activeTabId: string | null
}

type RenderMode = 'empty' | 'implemented' | 'placeholder'

const IMPLEMENTED_TAB_IDS = new Set<string>(['calendar', 'supplements'])

export function resolveRenderModeFromTabs(
  activeTabId: string | null,
  tabs: Array<{ id: string }>,
  implementedTabIds: Set<string> = IMPLEMENTED_TAB_IDS,
): RenderMode {
  if (!activeTabId) return 'empty'

  const isKnownTab = tabs.some((tab) => tab.id === activeTabId)
  if (!isKnownTab) return 'placeholder'

  return implementedTabIds.has(activeTabId) ? 'implemented' : 'placeholder'
}

export default function TapContent({ activeTabId }: TapContentProps) {
  const mode = resolveRenderModeFromTabs(activeTabId, TABS)

  if (mode === 'empty') {
    return (
      <p className="text-sm uppercase tracking-[0.2em] text-ink/60">
        탭을 선택해 시작하세요
      </p>
    )
  }

  if (mode === 'implemented' && activeTabId === 'calendar') {
    return (
      <div className="content-enter">
        <Tap2Calendar />
      </div>
    )
  }

  if (mode === 'implemented' && activeTabId === 'supplements') {
    return (
      <div className="content-enter">
        <Tap4Supplements />
      </div>
    )
  }

  return <DevPlaceholder />
}
