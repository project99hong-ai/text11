import { TABS } from '../lib/tabs'
import { resolveRenderModeFromTabs } from '../components/TapContent'

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message)
}

function run() {
  const modeNull = resolveRenderModeFromTabs(null, TABS)
  assert(modeNull === 'empty', 'activeTabId가 null이면 empty여야 합니다.')

  const modeCalendar = resolveRenderModeFromTabs('calendar', TABS)
  assert(modeCalendar === 'implemented', 'calendar는 implemented여야 합니다.')

  const modeSupplements = resolveRenderModeFromTabs('supplements', TABS)
  assert(modeSupplements === 'implemented', 'supplements는 implemented여야 합니다.')

  const modeCommunity = resolveRenderModeFromTabs('community', TABS)
  assert(modeCommunity === 'placeholder', 'community는 placeholder여야 합니다.')

  const modeUnknown = resolveRenderModeFromTabs('unknown-tab', TABS)
  assert(modeUnknown === 'placeholder', '알 수 없는 탭은 placeholder여야 합니다.')

  const expandedTabs = [
    ...TABS,
    { id: 'new-ai-tab', label: 'New AI Tab', emoji: '🧪', implemented: false },
  ]
  const modeNewTab = resolveRenderModeFromTabs('new-ai-tab', expandedTabs)
  assert(modeNewTab === 'placeholder', 'tabs.ts에 새 탭을 추가하면 자동으로 placeholder여야 합니다.')

  console.log('PASS: tabs.ts 새 탭 추가 시 placeholder fallback 동작 확인')
}

run()
