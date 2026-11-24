export const PRESET_OFFSETS = [-30, -90, -120, 30, 90, 120] as const

export type PresetOffset = (typeof PRESET_OFFSETS)[number]

export type Sign = -1 | 1

export type ValidationError =
  | "choose minus or plus"
  | "enter a whole number"
  | "that date is outside the supported range"
