import { formatPreset } from "../lib/formatDate"
import { PRESET_OFFSETS } from "../types"

export function PresetGrid() {
  return (
    <ul className="presets">
      {PRESET_OFFSETS.map((offset) => (
        <li key={offset}>{formatPreset(offset)}</li>
      ))}
    </ul>
  )
}
