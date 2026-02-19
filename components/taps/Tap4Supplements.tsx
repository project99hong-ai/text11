const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const supplements = ['Omega-3', 'Vitamin D', 'Magnesium']

export default function Tap4Supplements() {
  return (
    <div>
      <h3 className="text-lg uppercase tracking-[0.18em] text-ink">Supplements</h3>
      <div className="hairline mt-3" />

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs uppercase tracking-[0.2em] text-ink/70">
        {days.map((day) => (
          <span key={day} className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-ink/20" />
            {day}
          </span>
        ))}
      </div>

      <div className="hairline-dashed mt-4" />

      <ul className="mt-4 space-y-2 text-sm text-ink/80">
        {supplements.map((item) => (
          <li key={item} className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-ink/50" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
