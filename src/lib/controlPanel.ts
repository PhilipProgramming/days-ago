import { addCalendarDays, type CivilDate } from "./calendar"

export const DAY_COUNTS = [30, 90] as const

export type DayCount = (typeof DAY_COUNTS)[number]

export type Direction = "plus" | "minus"

export type ControlState = {
  direction: Direction | null
  count: DayCount | null
  applied: number | null
}

export const INITIAL_CONTROL: ControlState = Object.freeze({
  direction: null,
  count: null,
  applied: null,
})

export function selectDirection(state: ControlState, direction: Direction): ControlState {
  if (state.direction === direction) {
    return state
  }

  return { ...state, direction }
}

export function selectCount(state: ControlState, count: DayCount): ControlState {
  if (state.count === count) {
    return state
  }

  return { ...state, count }
}

export function check(state: ControlState): ControlState {
  if (state.direction === null || state.count === null) {
    return state
  }

  const applied = state.direction === "plus" ? state.count : -state.count
  if (state.applied === applied) {
    return state
  }

  return { ...state, applied }
}

export function allClear(state: ControlState): ControlState {
  if (state.direction === null && state.count === null && state.applied === null) {
    return state
  }

  return INITIAL_CONTROL
}

export function clearEntry(state: ControlState): ControlState {
  if (state.count === null) {
    return state
  }

  return { ...state, count: null }
}

export function dateForControl(today: CivilDate, state: ControlState): CivilDate {
  if (state.applied === null) {
    return today
  }

  return addCalendarDays(today, state.applied)
}
