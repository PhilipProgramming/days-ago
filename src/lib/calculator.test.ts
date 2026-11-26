import { describe, expect, it } from "vitest"
import type { CivilDate } from "./calendar"
import {
  INITIAL_CALCULATOR,
  allClearCalculator,
  appendDigit,
  backspaceDigit,
  calculatorAnnouncement,
  canPrint,
  clearCalculatorEntry,
  clearLimitNotice,
  displayText,
  printCalculation,
  resetCalculator,
  selectCalculatorDirection,
  type CalculatorState,
} from "./calculator"

const anchor: CivilDate = { year: 2026, month: 11, day: 25 }
const minus = "\u2212"

function enter(digits: string, direction: CalculatorState["direction"] = null): CalculatorState {
  const entered = [...digits].reduce(
    (state, character) => appendDigit(state, Number(character)),
    INITIAL_CALCULATOR,
  )

  return direction === null ? entered : selectCalculatorDirection(entered, direction)
}

describe("calculator initial state", () => {
  it("starts empty, with both directions released and nothing calculated", () => {
    expect(INITIAL_CALCULATOR).toEqual({
      direction: null,
      digits: "",
      noticeId: 0,
      limitNotice: false,
      result: null,
    })
    expect(displayText(INITIAL_CALCULATOR)).toBe("enter days...")
    expect(calculatorAnnouncement(INITIAL_CALCULATOR)).toBe("")
    expect(canPrint(INITIAL_CALCULATOR, anchor)).toBe(false)
  })
})

describe("calculator direction", () => {
  it("selects one direction at a time and keeps the typed digits", () => {
    const typed = enter("38")
    const future = selectCalculatorDirection(typed, "plus")
    const past = selectCalculatorDirection(future, "minus")
    const again = selectCalculatorDirection(past, "minus")

    expect(future.direction).toBe("plus")
    expect(future.digits).toBe("38")
    expect(displayText(future)).toBe("+38")
    expect(past.direction).toBe("minus")
    expect(past.digits).toBe("38")
    expect(displayText(past)).toBe(`${minus}38`)
    expect(again).toBe(past)
  })
})

describe("calculator numerical entry", () => {
  it("appends digits and drops unnecessary leading zeros", () => {
    const zeros = appendDigit(appendDigit(INITIAL_CALCULATOR, 0), 0)
    const value = appendDigit(zeros, 5)

    expect(zeros.digits).toBe("0")
    expect(displayText(zeros)).toBe("0")
    expect(value.digits).toBe("5")
    expect(displayText(value)).toBe("5")
    expect(enter("007").digits).toBe("7")
    expect(enter("090").digits).toBe("90")
  })

  it("accepts 365 and rejects a digit that would pass it", () => {
    const limit = enter("365")
    const rejected = appendDigit(limit, 0)
    const replaced = appendDigit(appendDigit(enter("36"), 6), 5)

    expect(limit.digits).toBe("365")
    expect(canPrint(selectCalculatorDirection(limit, "plus"), anchor)).toBe(true)
    expect(rejected.digits).toBe("365")
    expect(rejected.limitNotice).toBe(true)
    expect(rejected.noticeId).toBe(1)
    expect(displayText(rejected)).toBe("365 max")
    expect(displayText(clearLimitNotice(rejected, rejected.noticeId))).toBe("365")
    expect(clearLimitNotice(rejected, 0)).toBe(rejected)
    expect(replaced.digits).toBe("365")
    expect(replaced.limitNotice).toBe(false)
  })

  it("keeps zero and an empty entry from becoming printable", () => {
    const zero = enter("0", "plus")
    const empty = clearCalculatorEntry(zero)

    expect(canPrint(zero, anchor)).toBe(false)
    expect(canPrint(empty, anchor)).toBe(false)
    expect(canPrint(enter("12"), anchor)).toBe(false)
    expect(canPrint(enter(""), anchor)).toBe(false)
  })

  it("ignores values that are not a single digit", () => {
    const typed = enter("12")

    expect(appendDigit(typed, -1)).toBe(typed)
    expect(appendDigit(typed, 1.5)).toBe(typed)
    expect(appendDigit(typed, 10)).toBe(typed)
    expect(appendDigit(typed, Number.NaN)).toBe(typed)
  })
})

describe("calculator clearing", () => {
  it("clears every selection on all clear", () => {
    const ready = enter("90", "minus")
    const cleared = allClearCalculator(ready)

    expect(cleared).toBe(INITIAL_CALCULATOR)
    expect(allClearCalculator(cleared)).toBe(INITIAL_CALCULATOR)
    expect(displayText(cleared)).toBe("enter days...")
  })

  it("clears only the digits on clear entry", () => {
    const ready = enter("90", "minus")
    const cleared = clearCalculatorEntry(ready)

    expect(cleared.digits).toBe("")
    expect(cleared.direction).toBe("minus")
    expect(cleared.limitNotice).toBe(false)
    expect(displayText(cleared)).toBe("enter days...")
    expect(clearCalculatorEntry(cleared)).toBe(cleared)
  })

  it("removes the last digit on backspace", () => {
    const typed = enter("365", "plus")
    const once = backspaceDigit(typed)
    const twice = backspaceDigit(once)
    const empty = backspaceDigit(backspaceDigit(twice))

    expect(once.digits).toBe("36")
    expect(twice.digits).toBe("3")
    expect(empty.digits).toBe("")
    expect(backspaceDigit(empty)).toBe(empty)
  })

  it("drops a limit notice when a newer edit arrives and when the screen resets", () => {
    const rejected = appendDigit(enter("36", "plus"), 6)
    const edited = appendDigit(rejected, 5)

    expect(rejected.limitNotice).toBe(true)
    expect(edited.digits).toBe("365")
    expect(edited.limitNotice).toBe(false)
    expect(calculatorAnnouncement(rejected)).toBe("365 max")
    expect(resetCalculator()).toBe(INITIAL_CALCULATOR)
    expect(allClearCalculator(rejected)).toBe(INITIAL_CALCULATOR)
  })
})

describe("calculator printing", () => {
  it("stores the signed offset, the reference date, and the resulting date", () => {
    const future = printCalculation(enter("365", "plus"), anchor)
    const past = printCalculation(enter("38", "minus"), anchor)

    expect(future.result).toEqual({
      offset: 365,
      anchor,
      date: { year: 2027, month: 11, day: 25 },
    })
    expect(past.result).toEqual({
      offset: -38,
      anchor,
      date: { year: 2026, month: 10, day: 18 },
    })
    expect(displayText(future)).toBe("calculated")
    expect(calculatorAnnouncement(future)).toBe("calculated")
    expect(future.digits).toBe("365")
    expect(future.direction).toBe("plus")
    expect(printCalculation(future, anchor)).toBe(future)
  })

  it("crosses leap days and year boundaries", () => {
    const leap: CivilDate = { year: 2024, month: 2, day: 28 }
    const nextYear: CivilDate = { year: 2026, month: 12, day: 31 }
    const previousYear: CivilDate = { year: 2026, month: 1, day: 1 }

    expect(printCalculation(enter("1", "plus"), leap).result?.date).toEqual({
      year: 2024,
      month: 2,
      day: 29,
    })
    expect(printCalculation(enter("365", "plus"), leap).result?.date).toEqual({
      year: 2025,
      month: 2,
      day: 27,
    })
    expect(printCalculation(enter("1", "minus"), { year: 2024, month: 3, day: 1 }).result?.date).toEqual({
      year: 2024,
      month: 2,
      day: 29,
    })
    expect(printCalculation(enter("1", "minus"), { year: 2023, month: 3, day: 1 }).result?.date).toEqual({
      year: 2023,
      month: 2,
      day: 28,
    })
    expect(printCalculation(enter("1", "plus"), nextYear).result?.date).toEqual({
      year: 2027,
      month: 1,
      day: 1,
    })
    expect(printCalculation(enter("1", "minus"), previousYear).result?.date).toEqual({
      year: 2025,
      month: 12,
      day: 31,
    })
  })

  it("does not print an incomplete entry or an unsupported year", () => {
    const unsigned = enter("12")
    const zero = enter("0", "minus")
    const outOfRange = enter("1", "minus")
    const future = enter("12", "plus")
    const earliest: CivilDate = { year: 1000, month: 1, day: 1 }

    expect(printCalculation(INITIAL_CALCULATOR, anchor)).toBe(INITIAL_CALCULATOR)
    expect(printCalculation(unsigned, anchor)).toBe(unsigned)
    expect(printCalculation(zero, anchor)).toBe(zero)
    expect(canPrint(outOfRange, earliest)).toBe(false)
    expect(printCalculation(outOfRange, earliest)).toBe(outOfRange)
    expect(printCalculation(future, anchor).result?.offset).toBe(12)
  })

  it("clears the stored result when the entry or direction changes", () => {
    const printed = printCalculation(enter("30", "plus"), anchor)
    const extended = appendDigit(printed, 1)
    const blocked = appendDigit(printCalculation(enter("365", "plus"), anchor), 1)
    const redirected = selectCalculatorDirection(printed, "minus")
    const backed = backspaceDigit(printed)
    const entryCleared = clearCalculatorEntry(printed)
    const fullyCleared = allClearCalculator(printed)

    expect(extended.result).toBeNull()
    expect(extended.digits).toBe("301")
    expect(displayText(extended)).toBe("+301")
    expect(blocked.digits).toBe("365")
    expect(blocked.result?.offset).toBe(365)
    expect(blocked.limitNotice).toBe(true)
    expect(displayText(blocked)).toBe("365 max")
    expect(redirected.result).toBeNull()
    expect(redirected.direction).toBe("minus")
    expect(redirected.digits).toBe("30")
    expect(displayText(redirected)).toBe(`${minus}30`)
    expect(backed.result).toBeNull()
    expect(backed.digits).toBe("3")
    expect(entryCleared.result).toBeNull()
    expect(entryCleared.direction).toBe("plus")
    expect(fullyCleared).toBe(INITIAL_CALCULATOR)
  })

  it("can calculate again after the entry changes", () => {
    const first = printCalculation(enter("30", "plus"), anchor)
    const second = printCalculation(appendDigit(backspaceDigit(backspaceDigit(first)), 1), anchor)

    expect(first.result?.date).toEqual({ year: 2026, month: 12, day: 25 })
    expect(second.digits).toBe("1")
    expect(second.result).toEqual({
      offset: 1,
      anchor,
      date: { year: 2026, month: 11, day: 26 },
    })
  })
})
