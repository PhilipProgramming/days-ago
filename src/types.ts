export type Sign = -1 | 1

export type ValidationError =
  | "choose minus or plus"
  | "enter a whole number"
  | "that date is outside the supported range"
