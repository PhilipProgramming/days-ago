import { describe, expect, it } from "vitest"
import { formatCalendar, formatPreset, tomorrowSentence, yesterdaySentence } from "./formatDate"

describe("formatCalendar", () => {
  it("spells Tuesday 24 November 2026 in lowercase", () => {
    expect(formatCalendar({ year: 2026, month: 11, day: 24 })).toEqual({
      day: "tuesday",
      month: "november",
      number: "twenty-four",
      year: "twenty twenty-six",
    })
  })
})

describe("moving lines", () => {
  it("describes the calendar day before and after the anchor", () => {
    const anchor = { year: 2026, month: 11, day: 24 }
    expect(yesterdaySentence(anchor)).toBe(
      "yesterday was monday, the twenty-third day of november <<<",
    )
    expect(tomorrowSentence(anchor)).toBe(
      ">>> tomorrow will be wednesday, the twenty-fifth day of november",
    )
  })

  it("crosses the new year by calendar date", () => {
    expect(yesterdaySentence({ year: 2026, month: 1, day: 1 })).toBe(
      "yesterday was wednesday, the thirty-first day of december <<<",
    )
    expect(tomorrowSentence({ year: 2025, month: 12, day: 31 })).toBe(
      ">>> tomorrow will be thursday, the first day of january",
    )
  })
})

describe("formatPreset", () => {
  it("keeps the mockup signs on each preset", () => {
    expect(formatPreset(-30)).toBe("-30 days")
    expect(formatPreset(-90)).toBe("-90 days")
    expect(formatPreset(-120)).toBe("-120 days")
    expect(formatPreset(30)).toBe("+30 days")
    expect(formatPreset(90)).toBe("+90 days")
    expect(formatPreset(120)).toBe("+120 days")
  })
})
