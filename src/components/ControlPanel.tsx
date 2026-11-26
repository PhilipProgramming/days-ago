import { DAY_COUNTS, type DayCount, type Direction } from "../lib/controlPanel"

type ControlPanelProps = {
  direction: Direction | null
  count: DayCount | null
  onDirection: (direction: Direction) => void
  onCount: (count: DayCount) => void
  onCheck: () => void
  onAllClear: () => void
  onClearEntry: () => void
}

const DIRECTIONS = [
  { id: "plus", label: "plus, future offset", glyph: "+" },
  { id: "minus", label: "minus, past offset", glyph: "−" },
] as const

export function ControlPanel({
  direction,
  count,
  onDirection,
  onCount,
  onCheck,
  onAllClear,
  onClearEntry,
}: ControlPanelProps) {
  return (
    <div className="control-panel" role="group" aria-label="date offset">
      <div className="control-directions">
        {DIRECTIONS.map((item) => {
          const selected = direction === item.id

          return (
            <div className="direction-key" key={item.id}>
              <span className={selected ? "led is-lit" : "led"} aria-hidden="true" />
              <button
                type="button"
                className="keycap"
                aria-pressed={selected}
                aria-label={item.label}
                onClick={() => onDirection(item.id)}
              >
                {item.glyph}
              </button>
            </div>
          )
        })}
      </div>
      <div className="control-values">
        <div className="number-row">
          {DAY_COUNTS.map((value) => (
            <button
              key={value}
              type="button"
              className="keycap keycap-number"
              aria-pressed={count === value}
              aria-label={value === 30 ? "thirty days" : "ninety days"}
              onClick={() => onCount(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="keycap keycap-check"
          aria-label="check, apply offset"
          onClick={onCheck}
        >
          check
        </button>
      </div>
      <div className="control-clears">
        <button type="button" className="keycap" aria-label="ac, all clear" onClick={onAllClear}>
          ac
        </button>
        <button type="button" className="keycap" aria-label="ce, clear entry" onClick={onClearEntry}>
          ce
        </button>
      </div>
    </div>
  )
}
