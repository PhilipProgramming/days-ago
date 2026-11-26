import { addCalendarDays, isSupportedCivilDate, type CivilDate } from "./calendar"

export const MAX_CALCULATOR_DAYS = 365

export type CalculatorDirection = "plus" | "minus"

export type CalculationResult = {
  offset: number
  anchor: CivilDate
  date: CivilDate
}

export type CalculatorState = {
  direction: CalculatorDirection | null
  digits: string
  noticeId: number
  limitNotice: boolean
  result: CalculationResult | null
}

export const INITIAL_CALCULATOR: CalculatorState = Object.freeze({
  direction: null,
  digits: "",
  noticeId: 0,
  limitNotice: false,
  result: null,
})

const MINUS = "\u2212"

function sameCivilDate(left: CivilDate, right: CivilDate): boolean {
  return left.year === right.year && left.month === right.month && left.day === right.day
}

function normalizeEntry(raw: string): string | null {
  if (!/^[0-9]+$/.test(raw)) return null

  const stripped = raw.replace(/^0+/, "")
  const normalized = stripped === "" ? "0" : stripped
  if (normalized !== "0" && (normalized.length > 3 || Number(normalized) > MAX_CALCULATOR_DAYS)) {
    return null
  }

  return normalized
}

function toEntry(
  state: CalculatorState,
  digits: string,
  direction: CalculatorDirection | null,
): CalculatorState {
  if (
    state.digits === digits &&
    state.direction === direction &&
    state.result === null &&
    !state.limitNotice
  ) {
    return state
  }

  return {
    direction,
    digits,
    noticeId: state.noticeId,
    limitNotice: false,
    result: null,
  }
}

export function entryValue(state: CalculatorState): number | null {
  if (!/^[0-9]+$/.test(state.digits)) return null

  const value = Number(state.digits)
  if (value < 1 || value > MAX_CALCULATOR_DAYS) return null

  return value
}

export function signedOffset(state: CalculatorState): number | null {
  const magnitude = entryValue(state)
  if (state.direction === null || magnitude === null) return null

  return state.direction === "plus" ? magnitude : -magnitude
}

export function selectCalculatorDirection(
  state: CalculatorState,
  direction: CalculatorDirection,
): CalculatorState {
  if (state.direction === direction) return state

  return toEntry(state, state.digits, direction)
}

export function appendDigit(state: CalculatorState, digit: number): CalculatorState {
  if (!Number.isInteger(digit) || digit < 0 || digit > 9) return state

  const normalized = normalizeEntry(`${state.digits}${digit}`)
  if (normalized === null) {
    return {
      ...state,
      noticeId: state.noticeId + 1,
      limitNotice: true,
    }
  }

  return toEntry(state, normalized, state.direction)
}

export function backspaceDigit(state: CalculatorState): CalculatorState {
  if (state.digits === "" && state.result === null && !state.limitNotice) return state

  return toEntry(state, state.digits.slice(0, -1), state.direction)
}

export function allClearCalculator(state: CalculatorState): CalculatorState {
  if (
    state.direction === null &&
    state.digits === "" &&
    state.result === null &&
    !state.limitNotice &&
    state.noticeId === INITIAL_CALCULATOR.noticeId
  ) {
    return state
  }

  return INITIAL_CALCULATOR
}

export function clearCalculatorEntry(state: CalculatorState): CalculatorState {
  return toEntry(state, "", state.direction)
}

export function clearLimitNotice(state: CalculatorState, noticeId: number): CalculatorState {
  if (!state.limitNotice || state.noticeId !== noticeId) return state

  return { ...state, limitNotice: false }
}

export function canPrint(state: CalculatorState, anchor: CivilDate): boolean {
  const offset = signedOffset(state)
  if (offset === null) return false

  try {
    return isSupportedCivilDate(addCalendarDays(anchor, offset))
  } catch {
    return false
  }
}

export function printCalculation(state: CalculatorState, anchor: CivilDate): CalculatorState {
  const offset = signedOffset(state)
  if (offset === null || !canPrint(state, anchor)) return state

  const date = addCalendarDays(anchor, offset)
  const current = state.result
  if (
    current !== null &&
    current.offset === offset &&
    sameCivilDate(current.anchor, anchor) &&
    sameCivilDate(current.date, date) &&
    !state.limitNotice
  ) {
    return state
  }

  return {
    ...state,
    limitNotice: false,
    result: { offset, anchor, date },
  }
}

export function resetCalculator(): CalculatorState {
  return INITIAL_CALCULATOR
}

export function displayText(state: CalculatorState): string {
  if (state.limitNotice) return "365 max"
  if (state.result !== null) return "calculated"
  if (state.digits === "") return "enter days..."
  if (state.direction === null) return state.digits

  return `${state.direction === "plus" ? "+" : MINUS}${state.digits}`
}

export function calculatorAnnouncement(state: CalculatorState): string {
  if (state.limitNotice) return "365 max"
  if (state.result !== null) return "calculated"

  return ""
}
