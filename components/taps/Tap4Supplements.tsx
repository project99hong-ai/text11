'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import type { SupplementPreset, Timing } from '../../lib/supplementsDb'
import { SUPPLEMENT_PRESETS, findPresetByName } from '../../lib/supplementsDb'
import { loadJSON, saveJSON } from '../../lib/storage'
import {
  clamp,
  createInitialLayout,
  resolveCollisions,
  snapToGrid,
} from '../../lib/layout'

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
  takenByDate: Record<string, Timing[]>
  x: number
  y: number
  rotate: number
  pinned: boolean
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

const STORAGE_KEY = 'friday:supplements:v2'
const CUSTOM_PRESET_KEY = 'friday_custom_presets'
const STICKER_WIDTH = 260
const STICKER_HEIGHT = 150
const GRID_SNAP = 32
const REWARD_LIFT = 12
const COL_WIDTH = 300
const ROW_HEIGHT = 170
const CANVAS_PADDING = 72
const CANVAS_EXTRA = 140

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
    takenByDate: {},
    x: 0,
    y: 0,
    rotate: 0,
    pinned: false,
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

const benefitsClampStyle = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical' as const,
  overflow: 'hidden',
}

export default function Tap4Supplements() {
  const [items, setItems] = useState<SupplementItem[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [containerWidth, setContainerWidth] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)
  const [undoState, setUndoState] = useState<{
    itemId: string
    timing: Timing
    previous: SupplementItem[]
    expiresAt: number
  } | null>(null)
  const [draft, setDraft] = useState<AddDraft>({
    step: 1,
    name: '',
    benefits: '',
    timing: [],
    dosagePerDay: 1,
    presetKey: null,
  })
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>([])
  const canvasRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const saved = loadJSON<SupplementItem[]>(STORAGE_KEY, [])
    const legacy = loadJSON<SupplementItem[]>('friday_supplements', [])
    const savedPresets = loadJSON<CustomPreset[]>(CUSTOM_PRESET_KEY, [])
    setCustomPresets(savedPresets)
    if (saved.length) {
      setItems(saved.map(normalizeItem))
    } else if (legacy.length) {
      setItems(legacy.map(normalizeItem))
    } else {
      setItems(defaultItems())
    }
  }, [])

  useEffect(() => {
    if (!items.length) return
    saveJSON(STORAGE_KEY, items)
  }, [items])

  useEffect(() => {
    saveJSON(CUSTOM_PRESET_KEY, customPresets)
  }, [customPresets])

  useEffect(() => {
    if (!canvasRef.current) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      setContainerWidth(entry.contentRect.width)
      setContainerHeight(entry.contentRect.height)
    })
    observer.observe(canvasRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!containerWidth || !containerHeight || !items.length) return
    setItems((prev) => {
      if (prev.every((item) => item.x || item.y)) return prev
      const layout = createInitialLayout(prev.length, containerWidth)
      const seeded = prev.map((item, index) => ({
        ...item,
        x: item.x || layout[index].x,
        y: item.y || layout[index].y,
        rotate: item.rotate || layout[index].rotate,
      }))
      return resolveCollisions(seeded, {
        width: STICKER_WIDTH,
        height: STICKER_HEIGHT,
        containerWidth,
        containerHeight,
      })
    })
  }, [containerWidth, containerHeight, items.length])

  useEffect(() => {
    if (!undoState) return
    const remaining = undoState.expiresAt - Date.now()
    if (remaining <= 0) {
      setUndoState(null)
      return
    }
    const timer = window.setTimeout(() => {
      setUndoState(null)
    }, remaining)
    return () => window.clearTimeout(timer)
  }, [undoState])

  useEffect(() => {
    if (!draggingId) return
    const handleMove = (event: PointerEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      const nextX = event.clientX - rect.left - dragOffset.x
      const nextY = event.clientY - rect.top - dragOffset.y
      setItems((prev) =>
        prev.map((item) =>
          item.id === draggingId
            ? {
                ...item,
                x: clamp(nextX, 0, Math.max(0, rect.width - STICKER_WIDTH)),
                y: clamp(nextY, 0, Math.max(0, rect.height - STICKER_HEIGHT)),
              }
            : item,
        ),
      )
    }
    const handleUp = () => {
      setItems((prev) => {
        const snapped = prev.map((item) =>
          item.id === draggingId
            ? {
                ...item,
                x: clamp(
                  snapToGrid(item.x, GRID_SNAP),
                  0,
                  Math.max(0, containerWidth - STICKER_WIDTH),
                ),
                y: clamp(
                  snapToGrid(item.y, GRID_SNAP),
                  0,
                  Math.max(0, containerHeight - STICKER_HEIGHT),
                ),
              }
            : item,
        )
        if (!containerWidth || !containerHeight) return snapped
        return resolveCollisions(snapped, {
          width: STICKER_WIDTH,
          height: STICKER_HEIGHT,
          containerWidth,
          containerHeight,
        })
      })
      setDraggingId(null)
    }
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [draggingId, dragOffset, containerWidth, containerHeight])

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

    setItems((prev) => {
      const next = [...prev, createBaseItem(preset)]
      if (!containerWidth || !containerHeight) return next
      const layout = createInitialLayout(next.length, containerWidth)
      const seeded = next.map((item, index) => ({
        ...item,
        x: item.x || layout[index].x,
        y: item.y || layout[index].y,
        rotate: item.rotate || layout[index].rotate,
      }))
      return resolveCollisions(seeded, {
        width: STICKER_WIDTH,
        height: STICKER_HEIGHT,
        containerWidth,
        containerHeight,
      })
    })
    setDraft({ step: 1, name: '', benefits: '', timing: [], dosagePerDay: 1, presetKey: null })
  }

  const toggleTaken = (id: string, timing: Timing) => {
    const today = todayIso()
    setItems((prev) => {
      const next = prev.map((item) => {
        if (item.id !== id) return item
        const todayList = item.takenByDate[today] ?? []
        const hasTiming = todayList.includes(timing)
        const nextList = hasTiming
          ? todayList.filter((t) => t !== timing)
          : [...todayList, timing]
        const perTimingDose =
          item.dosagePerDay > 0
            ? Math.max(1, Math.round(item.dosagePerDay / Math.max(1, item.timing.length)))
            : 0
        const delta = hasTiming ? perTimingDose : -perTimingDose
        const rewardShift = hasTiming ? REWARD_LIFT : -REWARD_LIFT
        return {
          ...item,
          pillsRemaining: Math.max(0, item.pillsRemaining + delta),
          takenByDate: {
            ...item.takenByDate,
            [today]: nextList,
          },
          y: clamp(item.y + rewardShift, 0, Math.max(0, containerHeight - STICKER_HEIGHT)),
        }
      })
      const previous = prev.map((item) => ({ ...item }))
      setUndoState({
        itemId: id,
        timing,
        previous,
        expiresAt: Date.now() + 3000,
      })
      return next
    })
  }

  const updateItem = (id: string, patch: Partial<SupplementItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const handleEditSave = (id: string, next: SupplementItem) => {
    updateItem(id, next)
    setExpandedId(null)
  }

  const handlePinToggle = (id: string) => {
    setItems((prev) => {
      const next = prev.map((item) => {
        if (item.id !== id) return item
        if (!item.pinned) {
          return {
            ...item,
            pinned: true,
            rotate: clamp(item.rotate, -0.35, 0.35),
          }
        }
        return { ...item, pinned: false }
      })
      if (!containerWidth || !containerHeight) return next
      return resolveCollisions(next, {
        width: STICKER_WIDTH,
        height: STICKER_HEIGHT,
        containerWidth,
        containerHeight,
      })
    })
  }

  const cols = containerWidth ? Math.max(1, Math.floor(containerWidth / COL_WIDTH)) : 1
  const rows = Math.ceil(items.length / cols)
  const canvasHeight = CANVAS_PADDING + rows * ROW_HEIGHT + CANVAS_EXTRA
  const isMobile = containerWidth > 0 && containerWidth < 640

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-lg uppercase tracking-[0.18em] text-ink">SUPPLEMENTS</h3>
        <button
          type="button"
          className="text-sm uppercase tracking-[0.2em] text-ink/70 hover:text-ink"
          onClick={() => setDraft((prev) => ({ ...prev, step: 1 }))}
          data-no-drag="true"
        >
          + ADD SUPPLEMENT
        </button>
      </div>

      <div
        ref={canvasRef}
        className="relative mt-6 w-full select-none"
        style={{ minHeight: isMobile ? undefined : canvasHeight }}
      >
        {isMobile ? (
          <div className="space-y-6">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={index === 0 ? '' : 'border-t border-dashed border-ink/10 pt-6'}
              >
                <StickerContent
                  item={item}
                  timingOrder={timingOrder}
                  onToggleTaken={toggleTaken}
                  onEditToggle={() => setExpandedId((prev) => (prev === item.id ? null : item.id))}
                  expandedId={expandedId}
                  onSaveEdit={(next) => handleEditSave(item.id, next)}
                  onCancelEdit={() => setExpandedId(null)}
                  onTogglePin={() => handlePinToggle(item.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="absolute inset-0">
            {items.map((item) => {
              const isDragging = draggingId === item.id
              const scale = item.pinned ? 1.2 : 1
              const zIndex = item.pinned ? 50 : 10
              return (
                <div
                  key={item.id}
                  className="absolute"
                  style={{
                    transform: `translate(${item.x}px, ${item.y}px) rotate(${item.rotate}deg) scale(${scale})`,
                    zIndex,
                    width: STICKER_WIDTH,
                  }}
                  onPointerDown={(event) => {
                    const target = event.target as HTMLElement
                    if (target.closest('[data-no-drag="true"]')) return
                    const rect = canvasRef.current?.getBoundingClientRect()
                    if (!rect) return
                    setDraggingId(item.id)
                    setDragOffset({
                      x: event.clientX - rect.left - item.x,
                      y: event.clientY - rect.top - item.y,
                    })
                  }}
                >
                  <div
                    className="transition-transform duration-150 ease-out"
                    style={{
                      boxShadow: isDragging
                        ? '0 10px 18px rgba(0,0,0,0.08)'
                        : '0 6px 12px rgba(0,0,0,0.06)',
                    }}
                  >
                    <StickerContent
                      item={item}
                      timingOrder={timingOrder}
                      onToggleTaken={toggleTaken}
                      onEditToggle={() => setExpandedId((prev) => (prev === item.id ? null : item.id))}
                      expandedId={expandedId}
                      onSaveEdit={(next) => handleEditSave(item.id, next)}
                      onCancelEdit={() => setExpandedId(null)}
                      onTogglePin={() => handlePinToggle(item.id)}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
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
                data-no-drag="true"
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
                data-no-drag="true"
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
                  data-no-drag="true"
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
                      data-no-drag="true"
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
                  data-no-drag="true"
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
                  data-no-drag="true"
                />
              </div>
            )}
            <div className="mt-3 flex items-center gap-4">
              <button
                type="button"
                className="text-xs uppercase tracking-[0.2em] text-ink/70 hover:text-ink"
                onClick={() => setDraft((prev) => ({ ...prev, step: 3 }))}
                data-no-drag="true"
              >
                다음
              </button>
              <button
                type="button"
                className="text-xs uppercase tracking-[0.2em] text-ink/40 hover:text-ink/70"
                onClick={() =>
                  setDraft({ step: 1, name: '', benefits: '', timing: [], dosagePerDay: 1, presetKey: null })
                }
                data-no-drag="true"
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
                data-no-drag="true"
              >
                저장
              </button>
              <button
                type="button"
                className="text-xs uppercase tracking-[0.2em] text-ink/40 hover:text-ink/70"
                onClick={() =>
                  setDraft({ step: 1, name: '', benefits: '', timing: [], dosagePerDay: 1, presetKey: null })
                }
                data-no-drag="true"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>

      {undoState && (
        <div className="mt-6 flex items-center gap-4 text-xs text-ink/60">
          <span>방금 체크를 적용했습니다.</span>
          <button
            type="button"
            className="text-xs uppercase tracking-[0.2em] text-ink/70 hover:text-ink"
            onClick={() => {
              setItems(undoState.previous)
              setUndoState(null)
            }}
            data-no-drag="true"
          >
            Undo
          </button>
        </div>
      )}

      <p className="mt-8 text-xs text-ink/40">
        안내 정보는 참고용이며, 개인 건강 상태에 따라 전문가와 상담하세요.
      </p>
    </div>
  )
}

function StickerContent({
  item,
  timingOrder,
  onToggleTaken,
  onEditToggle,
  expandedId,
  onSaveEdit,
  onCancelEdit,
  onTogglePin,
}: {
  item: SupplementItem
  timingOrder: Timing[]
  onToggleTaken: (id: string, timing: Timing) => void
  onEditToggle: () => void
  expandedId: string | null
  onSaveEdit: (next: SupplementItem) => void
  onCancelEdit: () => void
  onTogglePin: () => void
}) {
  const today = todayIso()
  const todayTaken = item.takenByDate[today] ?? []
  const daysLeft =
    item.dosagePerDay > 0
      ? Math.floor(item.pillsRemaining / item.dosagePerDay)
      : null
  const iconSrc = ICON_MAP[item.icon] ?? ICON_MAP.multivitamin

  return (
    <div className="flex flex-col gap-3 px-2 py-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="text-graphite">
            <Image src={iconSrc} alt="" width={34} height={34} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="max-w-[170px] truncate text-[15px] font-semibold tracking-tight text-ink">
                {item.name}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {timingOrder
                  .filter((timing) => item.timing.includes(timing))
                  .map((timing) => (
                    <span
                      key={timing}
                      className="rounded-full border border-ink/25 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-ink/70"
                    >
                      {formatTiming(timing)}
                    </span>
                  ))}
              </div>
            </div>
            <p
              className="mt-1.5 text-sm leading-relaxed text-ink/60"
              style={benefitsClampStyle}
            >
              {item.benefits}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-[13px] text-ink/60 hover:text-ink"
            onClick={onEditToggle}
            data-no-drag="true"
            onPointerDown={(event) => event.stopPropagation()}
          >
            ✏️
          </button>
          <button
            type="button"
            className={`text-[13px] ${item.pinned ? 'text-accent' : 'text-ink/60'} hover:text-ink`}
            onClick={onTogglePin}
            data-no-drag="true"
            onPointerDown={(event) => event.stopPropagation()}
          >
            {item.pinned ? '★' : '☆'}
          </button>
        </div>
      </div>

      <div className="hairline-dashed" />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink/70 tabular-nums">
        <span>남은 알 {item.pillsRemaining}</span>
        {daysLeft === null ? (
          <span className="text-ink/60">섭취량 설정 필요</span>
        ) : (
          <span className={daysLeft <= 5 ? 'text-accent' : undefined}>
            남은 기간 {daysLeft}일
          </span>
        )}
        <div className="flex flex-wrap items-center gap-2 text-[13px] text-ink/70">
          {timingOrder
            .filter((timing) => item.timing.includes(timing))
            .map((timing) => (
              <label key={timing} className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={todayTaken.includes(timing)}
                  onChange={() => onToggleTaken(item.id, timing)}
                  className="h-3.5 w-3.5 accent-ink"
                  data-no-drag="true"
                  onPointerDown={(event) => event.stopPropagation()}
                />
                {formatTiming(timing)}
              </label>
            ))}
        </div>
      </div>

      <div
        className={`transition-[max-height,opacity,transform] duration-200 ease-out ${
          expandedId === item.id
            ? 'max-h-[320px] opacity-100'
            : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        {expandedId === item.id && (
          <EditForm item={item} onCancel={onCancelEdit} onSave={onSaveEdit} />
        )}
      </div>
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
    <div className="mt-2 space-y-3 text-sm text-ink/70">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2">
          구매일
          <input
            type="date"
            value={form.purchaseDate}
            onChange={(event) => setForm({ ...form, purchaseDate: event.target.value })}
            className="border-b border-ink/20 bg-transparent px-1 py-1 text-sm text-ink focus:border-ink/60 focus:outline-none"
            data-no-drag="true"
            onPointerDown={(event) => event.stopPropagation()}
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
            data-no-drag="true"
            onPointerDown={(event) => event.stopPropagation()}
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
            data-no-drag="true"
            onPointerDown={(event) => event.stopPropagation()}
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
            data-no-drag="true"
            onPointerDown={(event) => event.stopPropagation()}
          />
        </label>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="text-xs uppercase tracking-[0.2em] text-ink/70 hover:text-ink"
          onClick={() => onSave(form)}
          data-no-drag="true"
          onPointerDown={(event) => event.stopPropagation()}
        >
          저장
        </button>
        <button
          type="button"
          className="text-xs uppercase tracking-[0.2em] text-ink/40 hover:text-ink/70"
          onClick={onCancel}
          data-no-drag="true"
          onPointerDown={(event) => event.stopPropagation()}
        >
          취소
        </button>
      </div>
    </div>
  )
}

function normalizeItem(item: SupplementItem): SupplementItem {
  const anyItem = item as SupplementItem & { takenDates?: string[] }
  if (anyItem.takenByDate) return item
  const timing = item.timing.length ? item.timing : ['morning']
  const takenByDate: Record<string, Timing[]> = {}
  if (anyItem.takenDates) {
    anyItem.takenDates.forEach((date) => {
      takenByDate[date] = [...timing]
    })
  }
  return {
    ...item,
    timing,
    takenByDate,
    x: anyItem.x ?? 0,
    y: anyItem.y ?? 0,
    rotate: anyItem.rotate ?? 0,
    pinned: anyItem.pinned ?? false,
  }
}
