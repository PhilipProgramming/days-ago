import type { PresetOffset } from "../types"
import { addCalendarDays, type CivilDate } from "./calendar"

export type PresetSelection = PresetOffset | null

export function togglePreset(current: PresetSelection, offset: PresetOffset): PresetSelection {
  return current === offset ? null : offset
}

export function dateForPreset(today: CivilDate, selection: PresetSelection): CivilDate {
  if (selection === null) {
    return today
  }

  return addCalendarDays(today, selection)
}
