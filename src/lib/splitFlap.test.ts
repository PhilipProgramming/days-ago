import { describe, expect, it } from "vitest"
import { formatCalendar } from "./formatDate"
import {
  FLAP_COLUMNS,
  FLAP_ORDER,
  FLAP_ROWS,
  cardIndexAt,
  cycleSteps,
  flapKind,
  forwardGlyph,
  intermediateCount,
  padSlots,
  transitionEnd,
} from "./splitFlap"
import { spellCardinal, spellYear } from "./words"

const WEEKDAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const

function longestFormattedValue(): number {
  const day = Math.max(...WEEKDAYS.map((name) => name.length))
  const month = Math.max(...MONTHS.map((name) => name.length))
  const number = Math.max(...Array.from({ length: 31 }, (_, day) => spellCardinal(day + 1).length))
  let year = 0

  for (let value = 1000; value <= 9999; value += 1) {
    year = Math.max(year, spellYear(value).length)
  }

  return Math.max(day, month, number, year)
}

describe("uniform flap board", () => {
  it("derives one column count from the longest formatted value", () => {
    expect(longestFormattedValue()).toBe(27)
    expect(spellYear(7373)).toBe("seventy-three seventy-three")
    expect(FLAP_COLUMNS).toBe(longestFormattedValue())
    expect(FLAP_ROWS).toBe(4)
    expect(FLAP_ROWS * FLAP_COLUMNS).toBe(108)
  })

  it("left-aligns every row and keeps the shared trailing slots blank", () => {
    const may = padSlots("may", FLAP_COLUMNS)
    const three = padSlots("three", FLAP_COLUMNS)
    const year = padSlots("twenty twenty-six", FLAP_COLUMNS)

    expect(may).toHaveLength(FLAP_COLUMNS)
    expect(may.slice(0, 3)).toEqual(["m", "a", "y"])
    expect(may.slice(3).every((slot) => slot === "")).toBe(true)
    expect(three.slice(0, 5).join("")).toBe("three")
    expect(three.slice(5).every((slot) => slot === "")).toBe(true)
    expect(year.at(16)).toBe("x")
    expect(year.slice(17).every((slot) => slot === "")).toBe(true)
  })
})

describe("mechanical cycling", () => {
  it("uses three to seven ordered intermediates and lands on the destination", () => {
    for (let index = 0; index < FLAP_COLUMNS; index += 1) {
      const steps = cycleSteps("a", "m", index)
      const intermediates = steps.slice(0, -1)

      expect(intermediateCount(index)).toBeGreaterThanOrEqual(3)
      expect(intermediateCount(index)).toBeLessThanOrEqual(7)
      expect(intermediates).toHaveLength(intermediateCount(index))
      expect(steps.at(-1)).toBe("m")
      expect(intermediates.includes("m")).toBe(false)

      let previous = "a"
      for (const glyph of intermediates) {
        const skipped = forwardGlyph(previous) === "m" ? forwardGlyph("m") : forwardGlyph(previous)
        expect(glyph).toBe(skipped)
        expect(FLAP_ORDER.includes(glyph as (typeof FLAP_ORDER)[number])).toBe(true)
        previous = glyph
      }
    }
  })

  it("cycles blanks into letters and letters into blanks", () => {
    expect(cycleSteps("", "w", 2).at(-1)).toBe("w")
    expect(cycleSteps("w", "", 4).at(-1)).toBe("")
    expect(cycleSteps(" ", "-", 1)).toEqual(expect.arrayContaining(["-"]))
  })

  it("flips unchanged letters through two to four intermediates and returns", () => {
    for (const glyph of ["n", " ", "-"]) {
      for (let index = 0; index < FLAP_COLUMNS; index += 1) {
        const steps = cycleSteps(glyph, glyph, index)
        const intermediates = steps.slice(0, -1)

        expect(flapKind(glyph, glyph)).toBe("unchanged")
        expect(intermediates.length).toBeGreaterThanOrEqual(2)
        expect(intermediates.length).toBeLessThanOrEqual(4)
        expect(intermediates).toHaveLength(intermediateCount(index, "unchanged"))
        expect(steps.at(-1)).toBe(glyph)
        expect(intermediates.includes(glyph)).toBe(false)
      }
    }
  })

  it("flips blank slots through two or three intermediates before returning to blank", () => {
    for (let index = 0; index < FLAP_COLUMNS; index += 1) {
      const steps = cycleSteps("", "", index)
      const intermediates = steps.slice(0, -1)

      expect(flapKind("", "")).toBe("blank")
      expect(intermediates.length).toBeGreaterThanOrEqual(2)
      expect(intermediates.length).toBeLessThanOrEqual(3)
      expect(steps.at(-1)).toBe("")
      expect(intermediates.includes("")).toBe(false)
      expect(intermediates.every((glyph) => FLAP_ORDER.includes(glyph as (typeof FLAP_ORDER)[number]))).toBe(true)
    }
  })

  it("animates every slot of a date change, with trailing blanks finishing first", () => {
    const from = padSlots("tuesday", FLAP_COLUMNS)
    const to = padSlots("thursday", FLAP_COLUMNS)
    let slowestOccupied = 0
    let latestBlank = 0

    from.forEach((glyph, index) => {
      const steps = cycleSteps(glyph, to[index], index)
      const kind = flapKind(glyph, to[index])

      expect(steps.at(-1)).toBe(to[index])
      expect(steps.length).toBeGreaterThan(1)
      if (glyph === "" && to[index] === "") {
        latestBlank = Math.max(latestBlank, transitionEnd(index, kind, FLAP_ROWS - 1))
      } else {
        slowestOccupied = Math.max(slowestOccupied, transitionEnd(index, kind, FLAP_ROWS - 1))
      }
    })

    expect(from.slice(8).every((slot) => slot === "")).toBe(true)
    expect(latestBlank).toBeLessThan(slowestOccupied)
  })

  it("finishes the full board in about one second", () => {
    const ends = Array.from({ length: FLAP_ROWS }, (_, row) =>
      Array.from({ length: FLAP_COLUMNS }, (_, column) => transitionEnd(column, "changed", row)),
    ).flat()

    expect(Math.max(...ends)).toBeGreaterThanOrEqual(900)
    expect(Math.max(...ends)).toBeLessThanOrEqual(1000)
    expect(transitionEnd(0)).toBeLessThan(transitionEnd(24))
    expect(transitionEnd(24, "blank", 3)).toBeLessThan(transitionEnd(24, "changed", 3))
    expect(cardIndexAt(0, 1, 0)).toBeNull()
    expect(cardIndexAt(0, 0, 0)).toBe(0)
  })
})

describe("rapid flap retargeting", () => {
  it("drops an in-flight sequence and settles on the newest padded value", () => {
    const shown = padSlots("tuesday", FLAP_COLUMNS)
    const abandoned = shown.map((glyph, index) => cycleSteps(glyph, padSlots("saturday", FLAP_COLUMNS)[index], index))
    const replacement = shown.map((glyph, index) =>
      cycleSteps(glyph, padSlots("friday", FLAP_COLUMNS)[index], index),
    )

    expect(abandoned.some((steps) => steps.at(-1) === "s")).toBe(true)
    expect(replacement.map((steps) => steps.at(-1))).toEqual(padSlots("friday", FLAP_COLUMNS))
    expect(
      replacement.slice(8).every((steps, index) => {
        const intermediates = steps.slice(0, -1)
        return steps.at(-1) === "" && intermediates.length >= 2 && intermediates.length <= 3 && intermediates.length === intermediateCount(index + 8, "blank")
      }),
    ).toBe(true)
  })

  it("continues from a partially advanced board", () => {
    const shown = padSlots("tuesday", FLAP_COLUMNS)
    shown[0] = "s"
    const next = padSlots("friday", FLAP_COLUMNS)
    const steps = shown.map((glyph, index) => cycleSteps(glyph, next[index], index))

    expect(steps.map((sequence, index) => sequence.at(-1) ?? shown[index])).toEqual(next)
    expect(steps[0].at(-1)).toBe("f")
  })
})

describe("formatted values fit the grid", () => {
  it("pads a calendar readout without losing characters", () => {
    const parts = formatCalendar({ year: 2026, month: 9, day: 23 })

    const rows = [parts.day, parts.month, parts.number, parts.year].map((part) => padSlots(part, FLAP_COLUMNS))

    expect(rows).toHaveLength(FLAP_ROWS)
    expect(rows.flat()).toHaveLength(FLAP_ROWS * FLAP_COLUMNS)
    for (const [index, part] of [parts.day, parts.month, parts.number, parts.year].entries()) {
      expect(part.length).toBeLessThanOrEqual(FLAP_COLUMNS)
      expect(rows[index].join("")).toBe(part)
      expect(rows[index].slice(part.length).every((slot) => slot === "")).toBe(true)
    }
  })
})
