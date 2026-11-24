import type { Sign, ValidationError } from "../types"

export type CivilDate = {
  year: number
  month: number
  day: number
}

export const SUPPORTED_YEAR = {
  min: 1000,
  max: 9999,
} as const

export type ValidationResult =
  | { ok: true; offset: number }
  | { ok: false; error: ValidationError }

export function civilFromDate(date: Date): CivilDate {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  }
}

export function todayLocal(now = new Date()): CivilDate {
  return civilFromDate(now)
}

export function addCalendarDays(anchor: CivilDate, offset: number): CivilDate {
  const date = new Date(anchor.year, anchor.month - 1, anchor.day)
  date.setDate(date.getDate() + offset)

  if (Number.isNaN(date.getTime())) {
    throw new RangeError("Unsupported calendar date")
  }

  return civilFromDate(date)
}

export function isSupportedCivilDate(date: CivilDate): boolean {
  return date.year >= SUPPORTED_YEAR.min && date.year <= SUPPORTED_YEAR.max
}

export function validateDayOffset(
  sign: Sign | null,
  digits: string,
  anchor: CivilDate,
): ValidationResult {
  if (sign === null) {
    return { ok: false, error: "choose minus or plus" }
  }

  const trimmed = digits.trim()
  if (!/^\d+$/.test(trimmed)) {
    return { ok: false, error: "enter a whole number" }
  }

  const normalized = trimmed.replace(/^0+/, "") || "0"
  if (normalized.length > 7) {
    return { ok: false, error: "that date is outside the supported range" }
  }

  const magnitude = Number(normalized)
  const offset = sign * magnitude

  try {
    const result = addCalendarDays(anchor, offset)
    if (!isSupportedCivilDate(result)) {
      return { ok: false, error: "that date is outside the supported range" }
    }
  } catch {
    return { ok: false, error: "that date is outside the supported range" }
  }

  return { ok: true, offset }
}
