import Tap1Scan from './taps/Tap1Scan'
import Tap2Calendar from './taps/Tap2Calendar'
import Tap3Community from './taps/Tap3Community'
import Tap4Supplements from './taps/Tap4Supplements'
import Tap5Archive from './taps/Tap5Archive'

type TapContentProps = {
  activeTabId: string | null
}

export default function TapContent({ activeTabId }: TapContentProps) {
  if (!activeTabId) {
    return (
      <p className="text-sm uppercase tracking-[0.2em] text-ink/60">
        탭을 선택해 시작하세요
      </p>
    )
  }

  const content = {
    scan: <Tap1Scan />,
    calendar: <Tap2Calendar />,
    community: <Tap3Community />,
    supplements: <Tap4Supplements />,
    archive: <Tap5Archive />,
  }[activeTabId]

  return <div className="content-enter">{content}</div>
}
