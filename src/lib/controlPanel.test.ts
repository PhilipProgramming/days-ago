import { describe, expect, it } from "vitest"
import { addCalendarDays, type CivilDate } from "./calendar"
import {
  INITIAL_CONTROL,
  allClear,
  check,
  clearEntry,
  dateForControl,
  selectCount,
  selectDirection,
  type ControlState,
  type DayCount,
  type Direction,
} from "./controlPanel"
import { formatCalendar } from "./formatDate"

const anchor: CivilDate = { year: 2026, month: 11, day: 24 }

const combinations: Array<
  [Direction, DayCount, CivilDate, ReturnType<typeof formatCalendar>]
> = [
  [
    "plus",
    30,
    { year: 2026, month: 12, day: 24 },
    { day: "thursday", month: "december", number: "twenty-four", year: "twenty twenty-six" },
  ],
  [
    "minus",
    30,
    { year: 2026, month: 10, day: 25 },
    { day: "sunday", month: "october", number: "twenty-five", year: "twenty twenty-six" },
  ],
  [
    "plus",
    90,
    { year: 2027, month: 2, day: 22 },
    { day: "monday", month: "february", number: "twenty-two", year: "twenty twenty-seven" },
  ],
  [
    "minus",
    90,
    { year: 2026, month: 8, day: 26 },
    { day: "wednesday", month: "august", number: "twenty-six", year: "twenty twenty-six" },
  ],
]

function choose(direction: Direction, count: DayCount, state: ControlState = INITIAL_CONTROL) {
  return selectCount(selectDirection(state, direction), count)
}

describe("control panel initial state", () => {
  it("starts with nothing selected and today on the calendar", () => {
    expect(INITIAL_CONTROL).toEqual({ direction: null, count: null, applied: null })
    expect(dateForControl(anchor, INITIAL_CONTROL)).toEqual(anchor)
  })
})

describe("direction selection", () => {
  it("keeps one direction pending and leaves the calendar on today", () => {
    const plus = selectDirection(INITIAL_CONTROL, "plus")
    const again = selectDirection(plus, "plus")
    const minus = selectDirection(plus, "minus")

    expect(again).toBe(plus)
    expect(plus.direction).toBe("plus")
    expect(plus.count).toBeNull()
    expect(plus.applied).toBeNull()
    expect(minus.direction).toBe("minus")
    expect(minus.applied).toBeNull()
    expect(dateForControl(anchor, minus)).toEqual(anchor)
  })
})

describe("numerical selection", () => {
  it("keeps one number pending and leaves the calendar on today", () => {
    const thirty = selectCount(selectDirection(INITIAL_CONTROL, "plus"), 30)
    const again = selectCount(thirty, 30)
    const ninety = selectCount(thirty, 90)

    expect(again).toBe(thirty)
    expect(ninety.direction).toBe("plus")
    expect(ninety.count).toBe(90)
    expect(ninety.applied).toBeNull()
    expect(dateForControl(anchor, ninety)).toEqual(anchor)
  })
})

describe("check", () => {
  it("holds a complete selection until check applies it", () => {
    const pending = choose("minus", 30)
    expect(pending.applied).toBeNull()
    expect(dateForControl(anchor, pending)).toEqual(anchor)

    const applied = check(pending)
    expect(applied.direction).toBe("minus")
    expect(applied.count).toBe(30)
    expect(applied.applied).toBe(-30)
    expect(dateForControl(anchor, applied)).toEqual({ year: 2026, month: 10, day: 25 })
  })

  it("spells each signed offset from today", () => {
    for (const [direction, count, date, readout] of combinations) {
      const state = check(choose(direction, count))
      const result = dateForControl(anchor, state)
      expect(state.applied).toBe(direction === "plus" ? count : -count)
      expect(result).toEqual(date)
      expect(formatCalendar(result)).toEqual(readout)
    }
  })

  it("ignores a check while the direction or the number is missing", () => {
    const directionOnly = selectDirection(INITIAL_CONTROL, "plus")
    const countOnly = selectCount(INITIAL_CONTROL, 90)
    const applied = check(choose("plus", 30))
    const clearedNumber = clearEntry(applied)

    expect(check(INITIAL_CONTROL)).toBe(INITIAL_CONTROL)
    expect(check(directionOnly)).toBe(directionOnly)
    expect(check(countOnly)).toBe(countOnly)
    expect(check(clearedNumber)).toBe(clearedNumber)
    expect(dateForControl(anchor, directionOnly)).toEqual(anchor)
    expect(dateForControl(anchor, countOnly)).toEqual(anchor)
    expect(dateForControl(anchor, clearedNumber)).toEqual(dateForControl(anchor, applied))
  })

  it("keeps the same applied offset when that selection is checked again", () => {
    const once = check(choose("minus", 90))
    const twice = check(once)

    expect(twice).toBe(once)
    expect(twice.applied).toBe(-90)
    expect(dateForControl(anchor, twice)).toEqual(dateForControl(anchor, once))
  })
})

describe("all clear", () => {
  it("clears the panel and restores today", () => {
    const applied = check(choose("plus", 30))
    const cleared = allClear(applied)

    expect(cleared).toEqual({ direction: null, count: null, applied: null })
    expect(dateForControl(anchor, cleared)).toEqual(anchor)
    expect(allClear(cleared)).toBe(INITIAL_CONTROL)
  })

  it("leaves today in place when the calendar was already there", () => {
    const pending = choose("minus", 90)
    const cleared = allClear(pending)

    expect(cleared.direction).toBeNull()
    expect(cleared.count).toBeNull()
    expect(dateForControl(anchor, pending)).toEqual(anchor)
    expect(dateForControl(anchor, cleared)).toEqual(anchor)
  })
})

describe("clear entry", () => {
  it("clears only the pending number", () => {
    const applied = check(choose("plus", 90))
    const cleared = clearEntry(applied)

    expect(cleared.direction).toBe("plus")
    expect(cleared.count).toBeNull()
    expect(cleared.applied).toBe(90)
    expect(dateForControl(anchor, cleared)).toEqual(dateForControl(anchor, applied))
    expect(clearEntry(cleared)).toBe(cleared)
  })
})

describe("successive calculations", () => {
  it("keeps the latest complete offset through a rapid sequence", () => {
    let state = check(choose("plus", 30))
    state = check(choose("minus", 90, state))
    state = check(selectCount(state, 30))
    state = check(state)

    expect(state).toEqual({ direction: "minus", count: 30, applied: -30 })
    expect(dateForControl(anchor, state)).toEqual(addCalendarDays(anchor, -30))
  })

  it("measures every check from today rather than the displayed date", () => {
    const plusThirty = check(choose("plus", 30))
    const displayed = dateForControl(anchor, plusThirty)
    const minusNinety = check(choose("minus", 90, plusThirty))
    const fromToday = dateForControl(anchor, minusNinety)

    expect(displayed).toEqual({ year: 2026, month: 12, day: 24 })
    expect(fromToday).toEqual(addCalendarDays(anchor, -90))
    expect(fromToday).not.toEqual(addCalendarDays(displayed, -90))
    expect(dateForControl(anchor, check(selectCount(minusNinety, 30)))).toEqual(
      addCalendarDays(anchor, -30),
    )
  })

  it("follows a later today while the applied offset stays in place", () => {
    const state = check(choose("minus", 30))
    expect(dateForControl({ year: 2026, month: 11, day: 25 }, state)).toEqual({
      year: 2026,
      month: 10,
      day: 26,
    })
  })
})
