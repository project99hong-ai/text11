export function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
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
