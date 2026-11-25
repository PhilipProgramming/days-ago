import { SelectionCircle } from "./SelectionCircle"
import { formatPreset } from "../lib/formatDate"
import { PRESET_OFFSETS, type PresetOffset } from "../types"

type PresetGridProps = {
  selected: PresetOffset | null
  onSelect: (offset: PresetOffset) => void
}

export function PresetGrid({ selected, onSelect }: PresetGridProps) {
  return (
    <ul className="presets">
      {PRESET_OFFSETS.map((offset) => {
        const active = selected === offset

        return (
          <li key={offset}>
            <button
              type="button"
              className="preset-button"
              aria-pressed={active}
              onClick={() => onSelect(offset)}
            >
              {formatPreset(offset)}
              {active ? <SelectionCircle /> : null}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
