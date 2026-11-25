import { describe, expect, it } from "vitest"
import { formatCalendar } from "./formatDate"
import { dateForPreset, togglePreset, type PresetSelection } from "./presets"
import type { PresetOffset } from "../types"
import type { CivilDate } from "./calendar"

const anchor: CivilDate = { year: 2026, month: 11, day: 24 }

const presetDates: Array<[PresetOffset, CivilDate, ReturnType<typeof formatCalendar>]> = [
  [
    -30,
    { year: 2026, month: 10, day: 25 },
    { day: "sunday", month: "october", number: "twenty-five", year: "twenty twenty-six" },
  ],
  [
    -90,
    { year: 2026, month: 8, day: 26 },
    { day: "wednesday", month: "august", number: "twenty-six", year: "twenty twenty-six" },
  ],
  [
    -120,
    { year: 2026, month: 7, day: 27 },
    { day: "monday", month: "july", number: "twenty-seven", year: "twenty twenty-six" },
  ],
  [
    30,
    { year: 2026, month: 12, day: 24 },
    { day: "thursday", month: "december", number: "twenty-four", year: "twenty twenty-six" },
  ],
  [
    90,
    { year: 2027, month: 2, day: 22 },
    { day: "monday", month: "february", number: "twenty-two", year: "twenty twenty-seven" },
  ],
  [
    120,
    { year: 2027, month: 3, day: 24 },
    { day: "wednesday", month: "march", number: "twenty-four", year: "twenty twenty-seven" },
  ],
]

function applyClicks(clicks: PresetOffset[]): PresetSelection {
  return clicks.reduce<PresetSelection>((current, offset) => togglePreset(current, offset), null)
}

describe("dateForPreset", () => {
  it("starts on today when nothing is selected", () => {
    expect(dateForPreset(anchor, null)).toEqual(anchor)
  })

  it("spells each preset offset from the anchor", () => {
    for (const [offset, date, readout] of presetDates) {
      const result = dateForPreset(anchor, offset)
      expect(result).toEqual(date)
      expect(formatCalendar(result)).toEqual(readout)
    }
  })

  it("applies a new preset to today rather than the displayed date", () => {
    const selected = togglePreset(togglePreset(null, -30), 30)
    expect(selected).toBe(30)
    expect(dateForPreset(anchor, selected)).toEqual({ year: 2026, month: 12, day: 24 })
  })

  it("follows a later today while the same preset stays selected", () => {
    const nextToday = { year: 2026, month: 11, day: 25 }
    expect(dateForPreset(nextToday, -30)).toEqual({ year: 2026, month: 10, day: 26 })
  })
})

describe("togglePreset", () => {
  it("clears the active preset and keeps every other preset exclusive", () => {
    expect(togglePreset(null, -90)).toBe(-90)
    expect(togglePreset(-90, -90)).toBeNull()
    expect(togglePreset(-90, 120)).toBe(120)
    expect(togglePreset(120, -30)).toBe(-30)
  })

  it("keeps only the latest click across a rapid sequence", () => {
    expect(applyClicks([-30, -90, 120, 30])).toBe(30)
    expect(dateForPreset(anchor, applyClicks([-30, 90, -120]))).toEqual({
      year: 2026,
      month: 7,
      day: 27,
    })
    expect(applyClicks([-30, 120, 120])).toBeNull()
    expect(dateForPreset(anchor, applyClicks([90, -90, -90]))).toEqual(anchor)
  })
})
