export function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

type Rect = {
  x: number
  y: number
  width: number
  height: number
}

export function rectOverlap(a: Rect, b: Rect) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
}

export function createInitialLayout(count: number, containerWidth: number) {
  const colWidth = 300
  const rowHeight = 170
  const cols = Math.max(1, Math.floor(containerWidth / colWidth))

  return Array.from({ length: count }, (_, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)
    return {
      x: col * colWidth + rand(-18, 18),
      y: row * rowHeight + rand(-12, 12),
      rotate: rand(-1.2, 1.2),
    }
  })
}

export function snapToGrid(value: number, grid: number, jitter = 3) {
  const snapped = Math.round(value / grid) * grid
  return snapped + rand(-jitter, jitter)
}

export function resolveCollisions<T extends { id: string; x: number; y: number }>(
  items: T[],
  opts: {
    width: number
    height: number
    containerWidth: number
    containerHeight: number
    iterations?: number
  },
) {
  const iterations = opts.iterations ?? 3
  let next = items.map((item) => ({ ...item }))

  for (let loop = 0; loop < iterations; loop += 1) {
    for (let i = 0; i < next.length; i += 1) {
      for (let j = i + 1; j < next.length; j += 1) {
        const a = next[i]
        const b = next[j]
        const rectA = { x: a.x, y: a.y, width: opts.width, height: opts.height }
        const rectB = { x: b.x, y: b.y, width: opts.width, height: opts.height }
        if (!rectOverlap(rectA, rectB)) continue

        const nudgeY = rand(18, 28)
        const nudgeX = rand(-6, 6)
        b.y = clamp(b.y + nudgeY, 0, Math.max(0, opts.containerHeight - opts.height))
        b.x = clamp(b.x + nudgeX, 0, Math.max(0, opts.containerWidth - opts.width))
        next[j] = { ...b }
      }
    }
  }

  return next
}
