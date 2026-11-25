export const FLAP_ROWS = 4
export const FLAP_COLUMNS = 27

export const FLAP_ORDER = [
  "",
  " ",
  "-",
  ..."abcdefghijklmnopqrstuvwxyz".split(""),
] as const

export const FLAP_CARD_MS = 100
export const FLAP_COLUMN_STAGGER_MS = 6
export const FLAP_ROW_STAGGER_MS = 10
export const FLAP_TOP_MS = 46
export const FLAP_BOTTOM_DELAY_MS = 42
export const FLAP_BOTTOM_MS = 58

export type FlapKind = "changed" | "unchanged" | "blank"

export function padSlots(text: string, capacity: number): string[] {
  return Array.from({ length: capacity }, (_, index) => text[index] ?? "")
}

export function flapKind(from: string, to: string): FlapKind {
  if (from !== to) {
    return "changed"
  }
  return from === "" ? "blank" : "unchanged"
}

export function intermediateCount(index: number, kind: FlapKind = "changed"): number {
  const column = Math.abs(index)
  if (kind === "blank") {
    return 2 + (column % 2)
  }
  if (kind === "unchanged") {
    return 2 + (column % 3)
  }
  return 3 + (column % 5)
}

export function forwardGlyph(glyph: string): string {
  const found = FLAP_ORDER.indexOf(glyph as (typeof FLAP_ORDER)[number])
  const index = found < 0 ? 0 : found
  return FLAP_ORDER[(index + 1) % FLAP_ORDER.length]
}

export function cycleSteps(from: string, to: string, index: number): string[] {
  const steps: string[] = []
  let current = from

  while (steps.length < intermediateCount(index, flapKind(from, to))) {
    current = forwardGlyph(current)
    if (current === to) {
      current = forwardGlyph(current)
    }
    steps.push(current)
  }

  steps.push(to)
  return steps
}

export function slotStart(row: number, column: number): number {
  return row * FLAP_ROW_STAGGER_MS + column * FLAP_COLUMN_STAGGER_MS
}

export function transitionEnd(column: number, kind: FlapKind = "changed", row = 0): number {
  return slotStart(row, column) + (intermediateCount(column, kind) + 1) * FLAP_CARD_MS
}

export function cardIndexAt(elapsed: number, row: number, column: number): number | null {
  const local = elapsed - slotStart(row, column)
  if (local < 0) {
    return null
  }
  return Math.floor(local / FLAP_CARD_MS)
}
