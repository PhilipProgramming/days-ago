import type { PresetOffset } from "../types"
import { addCalendarDays, type CivilDate } from "./calendar"
import { spellCardinal, spellOrdinal, spellYear } from "./words"

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

export type CalendarReadout = {
  day: string
  month: string
  number: string
  year: string
}

function localDate(date: CivilDate): Date {
  return new Date(date.year, date.month - 1, date.day)
}

export function formatCalendar(date: CivilDate): CalendarReadout {
  return {
    day: WEEKDAYS[localDate(date).getDay()],
    month: MONTHS[date.month - 1],
    number: spellCardinal(date.day),
    year: spellYear(date.year),
  }
}

export function accessibleCalendar(date: CivilDate): string {
  const parts = formatCalendar(date)
  return `/day ${parts.day}, /month ${parts.month}, /number ${parts.number}, /year ${parts.year}`
}

export function yesterdaySentence(anchor: CivilDate): string {
  const date = addCalendarDays(anchor, -1)
  const parts = formatCalendar(date)
  return `yesterday was ${parts.day}, the ${spellOrdinal(date.day)} day of ${parts.month} <<<`
}

export function tomorrowSentence(anchor: CivilDate): string {
  const date = addCalendarDays(anchor, 1)
  const parts = formatCalendar(date)
  return `>>> tomorrow will be ${parts.day}, the ${spellOrdinal(date.day)} day of ${parts.month}`
}

export function formatPreset(offset: PresetOffset): string {
  return `${offset > 0 ? "+" : ""}${offset} days`
}
