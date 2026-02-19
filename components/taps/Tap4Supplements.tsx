'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import type { SupplementPreset, Timing } from '../../lib/supplementsDb'
import {
  SUPPLEMENT_PRESETS,
  findPresetByName,
} from '../../lib/supplementsDb'
import { loadJSON, saveJSON } from '../../lib/storage'

import iconMilkThistle from '../../icons/milk-thistle.svg'
import iconOmega3 from '../../icons/omega3.svg'
import iconVitaminC from '../../icons/vitamin-c.svg'
import iconVitaminD from '../../icons/vitamin-d.svg'
import iconMagnesium from '../../icons/magnesium.svg'
import iconProbiotics from '../../icons/probiotics.svg'
import iconZinc from '../../icons/zinc.svg'
import iconLutein from '../../icons/lutein.svg'
import iconCollagen from '../../icons/collagen.svg'
import iconMultivitamin from '../../icons/multivitamin.svg'

const ICON_MAP: Record<string, typeof iconMilkThistle> = {
  'milk-thistle': iconMilkThistle,
  omega3: iconOmega3,
  'vitamin-c': iconVitaminC,
  'vitamin-d': iconVitaminD,
  magnesium: iconMagnesium,
  probiotics: iconProbiotics,
  zinc: iconZinc,
  lutein: iconLutein,
  collagen: iconCollagen,
  multivitamin: iconMultivitamin,
}

type SupplementItem = {
  id: string
  name: string
  icon: string
  benefits: string
  timing: Timing[]
  purchaseDate: string
  totalPills: number
  pillsRemaining: number
  dosagePerDay: number
  takenDates: string[]
}

type CustomPreset = SupplementPreset

type AddDraft = {
  step: 1 | 2 | 3
  name: string
  benefits: string
  timing: Timing[]
  dosagePerDay: number
  presetKey: string | null
}

const STORAGE_KEY = 'friday_supplements'
const CUSTOM_PRESET_KEY = 'friday_custom_presets'

const todayIso = () => new Date().toISOString().slice(0, 10)

const createBaseItem = (preset: SupplementPreset): SupplementItem => {
  const purchaseDate = todayIso()
  const totalPills = preset.defaultDosagePerDay * 30
  return {
    id: `${preset.key}-${Date.now()}`,
    name: preset.displayName,
    icon: preset.icon,
    benefits: preset.benefits,
    timing: preset.timing,
    purchaseDate,
    totalPills,
    pillsRemaining: totalPills,
    dosagePerDay: preset.defaultDosagePerDay,
    takenDates: [],
  }
}

const defaultItems = () => [
  createBaseItem(SUPPLEMENT_PRESETS[0]),
  createBaseItem(SUPPLEMENT_PRESETS[1]),
  createBaseItem(SUPPLEMENT_PRESETS[3]),
]

const formatTiming = (timing: Timing) => {
  if (timing === 'morning') return '아침'
  if (timing === 'lunch') return '점심'
  return '저녁'
}

const timingOrder: Timing[] = ['morning', 'lunch', 'dinner']

export default function Tap4Supplements() {
  const [items, setItems] = useState<SupplementItem[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<AddDraft>({
    step: 1,
    name: '',
    benefits: '',
    timing: [],
    dosagePerDay: 1,
    presetKey: null,
  })
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>([])

  useEffect(() => {
    const saved = loadJSON<SupplementItem[]>(STORAGE_KEY, [])
    const savedPresets = loadJSON<CustomPreset[]>(CUSTOM_PRESET_KEY, [])
    setCustomPresets(savedPresets)
    setItems(saved.length ? saved : defaultItems())
  }, [])

  useEffect(() => {
    if (!items.length) return
    saveJSON(STORAGE_KEY, items)
  }, [items])

  useEffect(() => {
    saveJSON(CUSTOM_PRESET_KEY, customPresets)
  }, [customPresets])

  const allPresets = useMemo(
    () => [...SUPPLEMENT_PRESETS, ...customPresets],
    [customPresets],
  )

  const suggestedPreset = useMemo(() => {
    if (!draft.name.trim()) return null
    return (
      findPresetByName(draft.name) ??
      allPresets.find(
        (preset) => preset.displayName.includes(draft.name.trim()),
      ) ??
      null
    )
  }, [draft.name, allPresets])

  const setDraftWithPreset = (preset: SupplementPreset) => {
    setDraft({
      step: 2,
      name: preset.displayName,
      benefits: preset.benefits,
      timing: preset.timing,
      dosagePerDay: preset.defaultDosagePerDay,
      presetKey: preset.key,
    })
  }

  const handleCreate = () => {
    if (!draft.name.trim()) return
    const timing = draft.timing.length ? draft.timing : ['morning']
    const preset: SupplementPreset = {
      key: draft.presetKey ?? draft.name.trim().toLowerCase().replace(/\s+/g, '-'),
      displayName: draft.name.trim(),
      icon: draft.presetKey ?? 'multivitamin',
      timing,
      benefits: draft.benefits || '효능 정보를 추가해 주세요.',
      defaultDosagePerDay: draft.dosagePerDay || 1,
    }

    if (!draft.presetKey) {
      setCustomPresets((prev) => {
        if (prev.some((p) => p.key === preset.key)) return prev
        return [...prev, preset]
      })
    }

    setItems((prev) => [...prev, createBaseItem(preset)])
    setDraft({ step: 1, name: '', benefits: '', timing: [], dosagePerDay: 1, presetKey: null })
  }

  const toggleTaken = (id: string) => {
    const today = todayIso()
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const hasToday = item.takenDates.includes(today)
        return {
          ...item,
          takenDates: hasToday
            ? item.takenDates.filter((date) => date !== today)
            : [...item.takenDates, today],
        }
      }),
    )
  }

  const updateItem = (id: string, patch: Partial<SupplementItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const handleEditSave = (id: string, next: SupplementItem) => {
    updateItem(id, next)
    setExpandedId(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-lg uppercase tracking-[0.18em] text-ink">Supplements</h3>
        <button
          type="button"
          className="text-sm uppercase tracking-[0.2em] text-ink/70 hover:text-ink"
          onClick={() => setDraft((prev) => ({ ...prev, step: 1 }))}
        >
          + Add supplement
        </button>
      </div>
      <div className="hairline mt-3" />

      <div className="mt-6 space-y-6">
        {items.map((item, index) => {
          const daysLeft =
            item.dosagePerDay > 0
              ? Math.floor(item.pillsRemaining / item.dosagePerDay)
              : null
          const today = todayIso()
          const todayTaken = item.takenDates.includes(today)
          const iconSrc = ICON_MAP[item.icon] ?? ICON_MAP.multivitamin

          return (
            <div key={item.id} className={index === 0 ? '' : 'border-t border-ink/10 pt-6'}>
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="text-graphite">
                    <Image src={iconSrc} alt="" width={36} height={36} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-lg font-semibold tracking-tight text-ink">
                        {item.name}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {timingOrder
                          .filter((timing) => item.timing.includes(timing))
                          .map((timing) => (
                            <span
                              key={timing}
                              className="rounded-full border border-ink/30 px-2 py-0.5 text-[11px] uppercase tracking-[0.18em] text-ink/70"
                            >
                              {formatTiming(timing)}
                            </span>
                          ))}
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink/60">
                      {item.benefits}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-xs uppercase tracking-[0.2em] text-ink/60 hover:text-ink"
                  onClick={() =>
                    setExpandedId((prev) => (prev === item.id ? null : item.id))
                  }
                >
                  편집
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink/70 tabular-nums">
                <span>남은 알 {item.pillsRemaining}</span>
                {daysLeft === null ? (
                  <span className="text-ink/60">섭취량 설정 필요</span>
                ) : (
                  <span>남은 기간 {daysLeft}일</span>
                )}
                <label className="flex items-center gap-2 text-sm text-ink/70">
                  <input
                    type="checkbox"
                    checked={todayTaken}
                    onChange={() => toggleTaken(item.id)}
                    className="h-4 w-4 accent-ink"
                  />
                  오늘 섭취
                </label>
              </div>

              <div
                className={`transition-[max-height,opacity,transform] duration-200 ease-out ${
                  expandedId === item.id
                    ? 'mt-4 max-h-[320px] opacity-100'
                    : 'mt-0 max-h-0 opacity-0'
                } overflow-hidden`}
              >
                {expandedId === item.id && (
                  <EditForm
                    item={item}
                    onCancel={() => setExpandedId(null)}
                    onSave={(next) => handleEditSave(item.id, next)}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="hairline-dashed mt-8" />

      <div className="mt-6 space-y-4">
        {draft.step === 1 && (
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink/60">Step 1</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="영양제 이름 입력"
                value={draft.name}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, name: event.target.value }))
                }
                className="w-72 border-b border-ink/20 bg-transparent px-0 py-2 text-sm text-ink focus:border-ink/60 focus:outline-none"
              />
              <button
                type="button"
                className="text-xs uppercase tracking-[0.2em] text-ink/70 hover:text-ink"
                onClick={() => {
                  if (suggestedPreset) {
                    setDraftWithPreset(suggestedPreset)
                  } else if (draft.name.trim()) {
                    setDraft((prev) => ({ ...prev, step: 2 }))
                  }
                }}
              >
                다음
              </button>
            </div>
            {suggestedPreset && (
              <div className="mt-3 text-sm text-ink/70">
                추천: 
                <button
                  type="button"
                  className="ml-2 text-sm underline underline-offset-4"
                  onClick={() => setDraftWithPreset(suggestedPreset)}
                >
                  {suggestedPreset.displayName}
                </button>
              </div>
            )}
          </div>
        )}

        {draft.step === 2 && (
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink/60">Step 2</p>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <div className="flex flex-wrap gap-3">
                {timingOrder.map((timing) => (
                  <label key={timing} className="flex items-center gap-2 text-sm text-ink/70">
                    <input
                      type="checkbox"
                      checked={draft.timing.includes(timing)}
                      onChange={() =>
                        setDraft((prev) => {
                          const exists = prev.timing.includes(timing)
                          return {
                            ...prev,
                            timing: exists
                              ? prev.timing.filter((t) => t !== timing)
                              : [...prev.timing, timing],
                          }
                        })
                      }
                      className="h-4 w-4 accent-ink"
                    />
                    {formatTiming(timing)}
                  </label>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm text-ink/70">
                <span>하루 섭취량</span>
                <input
                  type="number"
                  min={0}
                  value={draft.dosagePerDay}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      dosagePerDay: Number(event.target.value),
                    }))
                  }
                  className="w-16 border-b border-ink/20 bg-transparent px-1 py-1 text-sm text-ink focus:border-ink/60 focus:outline-none"
                />
              </div>
            </div>
            {!draft.presetKey && (
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="효능 한 줄 입력"
                  value={draft.benefits}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, benefits: event.target.value }))
                  }
                  className="w-full max-w-md border-b border-ink/20 bg-transparent px-0 py-2 text-sm text-ink focus:border-ink/60 focus:outline-none"
                />
              </div>
            )}
            <div className="mt-3 flex items-center gap-4">
              <button
                type="button"
                className="text-xs uppercase tracking-[0.2em] text-ink/70 hover:text-ink"
                onClick={() => setDraft((prev) => ({ ...prev, step: 3 }))}
              >
                다음
              </button>
              <button
                type="button"
                className="text-xs uppercase tracking-[0.2em] text-ink/40 hover:text-ink/70"
                onClick={() =>
                  setDraft({ step: 1, name: '', benefits: '', timing: [], dosagePerDay: 1, presetKey: null })
                }
              >
                취소
              </button>
            </div>
          </div>
        )}

        {draft.step === 3 && (
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink/60">Step 3</p>
            <p className="mt-2 text-sm text-ink/70">
              {draft.name} · {draft.timing.map(formatTiming).join(' / ')} · 하루 {draft.dosagePerDay}정
            </p>
            <div className="mt-3 flex items-center gap-4">
              <button
                type="button"
                className="text-xs uppercase tracking-[0.2em] text-ink/70 hover:text-ink"
                onClick={handleCreate}
              >
                저장
              </button>
              <button
                type="button"
                className="text-xs uppercase tracking-[0.2em] text-ink/40 hover:text-ink/70"
                onClick={() =>
                  setDraft({ step: 1, name: '', benefits: '', timing: [], dosagePerDay: 1, presetKey: null })
                }
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-8 text-xs text-ink/40">
        안내 정보는 참고용이며, 개인 건강 상태에 따라 전문가와 상담하세요.
      </p>
    </div>
  )
}

function EditForm({
  item,
  onCancel,
  onSave,
}: {
  item: SupplementItem
  onCancel: () => void
  onSave: (next: SupplementItem) => void
}) {
  const [form, setForm] = useState(item)

  useEffect(() => {
    setForm(item)
  }, [item])

  return (
    <div className="mt-4 space-y-3 text-sm text-ink/70">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2">
          구매일
          <input
            type="date"
            value={form.purchaseDate}
            onChange={(event) => setForm({ ...form, purchaseDate: event.target.value })}
            className="border-b border-ink/20 bg-transparent px-1 py-1 text-sm text-ink focus:border-ink/60 focus:outline-none"
          />
        </label>
        <label className="flex items-center gap-2">
          총 알 수
          <input
            type="number"
            min={0}
            value={form.totalPills}
            onChange={(event) => setForm({ ...form, totalPills: Number(event.target.value) })}
            className="w-20 border-b border-ink/20 bg-transparent px-1 py-1 text-sm text-ink focus:border-ink/60 focus:outline-none"
          />
        </label>
        <label className="flex items-center gap-2">
          1일 섭취량
          <input
            type="number"
            min={0}
            value={form.dosagePerDay}
            onChange={(event) => setForm({ ...form, dosagePerDay: Number(event.target.value) })}
            className="w-16 border-b border-ink/20 bg-transparent px-1 py-1 text-sm text-ink focus:border-ink/60 focus:outline-none"
          />
        </label>
        <label className="flex items-center gap-2">
          남은 알
          <input
            type="number"
            min={0}
            value={form.pillsRemaining}
            onChange={(event) =>
              setForm({ ...form, pillsRemaining: Number(event.target.value) })
            }
            className="w-20 border-b border-ink/20 bg-transparent px-1 py-1 text-sm text-ink focus:border-ink/60 focus:outline-none"
          />
        </label>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="text-xs uppercase tracking-[0.2em] text-ink/70 hover:text-ink"
          onClick={() => onSave(form)}
        >
          저장
        </button>
        <button
          type="button"
          className="text-xs uppercase tracking-[0.2em] text-ink/40 hover:text-ink/70"
          onClick={onCancel}
        >
          취소
        </button>
      </div>
    </div>
  )
}
