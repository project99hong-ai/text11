'use client'

import { useState } from 'react'
import IconTabs from '../components/IconTabs'
import TapContent from '../components/TapContent'

export default function Home() {
  const [activeTabId, setActiveTabId] = useState<string | null>(null)

  const handleSelect = (id: string) => {
    setActiveTabId((prev) => (prev === id ? null : id))
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="page-bg" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 pb-16 pt-10">
        <header className="flex items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-5xl tracking-[0.08em]">FRIDAY</h1>
            <div className="hand-underline" aria-hidden="true" />
          </div>
          <p className="text-sm uppercase tracking-[0.2em] text-ink/70">
            Press the service you want
          </p>
        </header>

        <section className="mt-6">
          <IconTabs activeId={activeTabId} onSelect={handleSelect} />
        </section>

        <section className="mt-2 min-h-[20vh]">
          <TapContent activeTabId={activeTabId} />
        </section>
      </div>
    </main>
  )
}
