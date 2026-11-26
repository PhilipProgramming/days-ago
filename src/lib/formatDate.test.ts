import { describe, expect, it } from "vitest"
import { accessibleCalendar, formatCalendar, tomorrowSentence, yesterdaySentence } from "./formatDate"

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

describe("accessibleCalendar", () => {
  it("exposes the four destination values in one announcement", () => {
    expect(accessibleCalendar({ year: 2026, month: 11, day: 24 })).toBe(
      "/day tuesday, /month november, /number twenty-four, /year twenty twenty-six",
    )
  })

  it("follows the formatted date rather than an in-flight flap sequence", () => {
    const before = accessibleCalendar({ year: 2026, month: 11, day: 24 })
    const after = accessibleCalendar({ year: 2026, month: 11, day: 25 })

    expect(after).toBe("/day wednesday, /month november, /number twenty-five, /year twenty twenty-six")
    expect(after).not.toBe(before)
    expect(after).not.toContain("tuesday")
  })
})
