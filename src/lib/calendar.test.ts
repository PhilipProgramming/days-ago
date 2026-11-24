import { describe, expect, it } from "vitest"
import {
  addCalendarDays,
  todayLocal,
  validateDayOffset,
  type CivilDate,
} from "./calendar"

const anchor: CivilDate = { year: 2026, month: 11, day: 24 }

function utcAdd(date: CivilDate, offset: number): CivilDate {
  const next = new Date(Date.UTC(date.year, date.month - 1, date.day + offset))
  return {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
  }
}

describe("addCalendarDays", () => {
  it("matches UTC calendar-day addition across month lengths and leap days", () => {
    const cases: Array<[CivilDate, number]> = [
      [{ year: 2024, month: 2, day: 28 }, 1],
      [{ year: 2024, month: 2, day: 29 }, 1],
      [{ year: 2024, month: 3, day: 1 }, -1],
      [{ year: 2023, month: 3, day: 1 }, -1],
      [{ year: 2024, month: 1, day: 31 }, 1],
      [{ year: 2023, month: 4, day: 30 }, 1],
      [{ year: 2023, month: 5, day: 31 }, 1],
      [{ year: 2025, month: 12, day: 31 }, 1],
      [{ year: 2026, month: 1, day: 1 }, -1],
      [{ year: 2026, month: 3, day: 8 }, 1],
      [{ year: 2026, month: 11, day: 1 }, 1],
      [anchor, 19283],
      [anchor, -19283],
      [anchor, 0],
    ]

    for (const [date, offset] of cases) {
      expect(addCalendarDays(date, offset)).toEqual(utcAdd(date, offset))
    }
  })

  it("reads the local civil date from a timestamp", () => {
    const now = new Date(2026, 10, 24, 23, 30)
    expect(todayLocal(now)).toEqual(anchor)
  })
})

describe("validateDayOffset", () => {
  it("accepts a large magnitude, zero, and leading zeros", () => {
    expect(validateDayOffset(-1, "19283", anchor)).toEqual({ ok: true, offset: -19283 })
    expect(validateDayOffset(1, "0", anchor)).toEqual({ ok: true, offset: 0 })
    expect(validateDayOffset(1, "00030", anchor)).toEqual({ ok: true, offset: 30 })
  })

  it("rejects a missing sign before it checks the digits", () => {
    expect(validateDayOffset(null, "30", anchor)).toEqual({
      ok: false,
      error: "choose minus or plus",
    })
  })

  it("rejects empty, decimal, and alphabetic input", () => {
    for (const digits of ["", "   ", "12.5", "1e3", "abc", "-5", "+5"]) {
      expect(validateDayOffset(1, digits, anchor)).toEqual({
        ok: false,
        error: "enter a whole number",
      })
    }
  })

  it("rejects offsets outside years 1000 through 9999", () => {
    const start = Date.UTC(anchor.year, anchor.month - 1, anchor.day)
    const lastSupported = Math.round((Date.UTC(9999, 11, 31) - start) / 86_400_000)
    const firstSupported = Math.round((Date.UTC(1000, 0, 1) - start) / 86_400_000)

    expect(validateDayOffset(1, String(lastSupported), anchor)).toEqual({
      ok: true,
      offset: lastSupported,
    })
    expect(validateDayOffset(1, String(lastSupported + 1), anchor)).toEqual({
      ok: false,
      error: "that date is outside the supported range",
    })
    expect(validateDayOffset(-1, String(Math.abs(firstSupported)), anchor)).toEqual({
      ok: true,
      offset: firstSupported,
    })
    expect(validateDayOffset(-1, String(Math.abs(firstSupported) + 1), anchor)).toEqual({
      ok: false,
      error: "that date is outside the supported range",
    })
    expect(validateDayOffset(1, "3000000", anchor)).toEqual({
      ok: false,
      error: "that date is outside the supported range",
    })
  })
})
