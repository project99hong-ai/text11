const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const days = Array.from({ length: 28 }, (_, i) => i + 1)

export default function Tap2Calendar() {
  return (
    <div>
      <h3 className="text-lg uppercase tracking-[0.18em] text-ink">Calendar</h3>
      <div className="hairline mt-3" />
      <div className="mt-4 grid grid-cols-7 text-xs uppercase tracking-[0.2em] text-ink/70">
        {weekdays.map((day) => (
          <div key={day} className="pb-2">
            {day}
          </div>
        ))}
      </div>
      <div className="hairline-dashed" />
      <div className="mt-3 grid grid-cols-7 gap-y-3 text-sm text-ink/80">
        {days.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>
    </div>
  )
}
