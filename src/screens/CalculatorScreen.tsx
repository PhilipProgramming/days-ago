import { useEffect, useRef, useState } from "react"
import type { CivilDate } from "../lib/calendar"
import {
  INITIAL_CALCULATOR,
  allClearCalculator,
  appendDigit,
  backspaceDigit,
  calculatorAnnouncement,
  canPrint,
  clearCalculatorEntry,
  clearLimitNotice,
  displayText,
  printCalculation,
  selectCalculatorDirection,
  type CalculatorDirection,
  type CalculatorState,
} from "../lib/calculator"

const LIMIT_NOTICE_MS = 900

const DIGITS = [
  { digit: 1, name: "one", column: 2, row: 1 },
  { digit: 2, name: "two", column: 3, row: 1 },
  { digit: 3, name: "three", column: 4, row: 1 },
  { digit: 4, name: "four", column: 5, row: 1 },
  { digit: 5, name: "five", column: 6, row: 1 },
  { digit: 6, name: "six", column: 2, row: 2 },
  { digit: 7, name: "seven", column: 3, row: 2 },
  { digit: 8, name: "eight", column: 4, row: 2 },
  { digit: 9, name: "nine", column: 5, row: 2 },
  { digit: 0, name: "zero", column: 6, row: 2 },
] as const

type CalculatorScreenProps = {
  today: CivilDate
  onEscape: () => void
}

function isMinusKey(event: KeyboardEvent): boolean {
  return event.key === "-" || event.key === "\u2212" || event.code === "NumpadSubtract"
}

function isPlusKey(event: KeyboardEvent): boolean {
  return event.key === "+" || event.code === "NumpadAdd"
}

export function CalculatorScreen({ today, onEscape }: CalculatorScreenProps) {
  const screenRef = useRef<HTMLElement>(null)
  const [state, setState] = useState<CalculatorState>(INITIAL_CALCULATOR)
  const printable = canPrint(state, today)

  useEffect(() => {
    screenRef.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    if (!state.limitNotice) return

    const noticeId = state.noticeId
    const timer = window.setTimeout(() => {
      setState((current) => clearLimitNotice(current, noticeId))
    }, LIMIT_NOTICE_MS)

    return () => window.clearTimeout(timer)
  }, [state.limitNotice, state.noticeId])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return

      const onButton = event.target instanceof HTMLButtonElement

      if (event.key === "Escape") {
        event.preventDefault()
        onEscape()
        return
      }

      if (event.key === "Backspace") {
        event.preventDefault()
        setState((current) => backspaceDigit(current))
        return
      }

      if (event.key === "Enter") {
        if (onButton) return
        setState((current) => printCalculation(current, today))
        return
      }

      if (isPlusKey(event)) {
        setState((current) => selectCalculatorDirection(current, "plus"))
        return
      }

      if (isMinusKey(event)) {
        setState((current) => selectCalculatorDirection(current, "minus"))
        return
      }

      if (/^[0-9]$/.test(event.key)) {
        setState((current) => appendDigit(current, Number(event.key)))
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onEscape, today])

  function chooseDirection(direction: CalculatorDirection) {
    setState((current) => selectCalculatorDirection(current, direction))
  }

  return (
    <main
      ref={screenRef}
      className="calculator-screen"
      tabIndex={-1}
      aria-label="different day calculator"
    >
      <div className="calculator">
        <div className="calculator-top">
          <p className="calc-display calc-recess">{displayText(state)}</p>
          <div className="printer-housing calc-recess" aria-hidden="true">
            <div className="printer-slot" />
          </div>
        </div>
        <div className="calculator-pad">
          <div className="direction-key" style={{ gridColumn: 1, gridRow: 1 }}>
            <span className={state.direction === "plus" ? "led is-lit" : "led"} aria-hidden="true" />
            <button
              type="button"
              className="keycap keycap-square"
              aria-pressed={state.direction === "plus"}
              aria-label="plus, future offset"
              onClick={() => chooseDirection("plus")}
            >
              +
            </button>
          </div>
          <div className="direction-key" style={{ gridColumn: 1, gridRow: 2 }}>
            <span className={state.direction === "minus" ? "led is-lit" : "led"} aria-hidden="true" />
            <button
              type="button"
              className="keycap keycap-square"
              aria-pressed={state.direction === "minus"}
              aria-label="minus, past offset"
              onClick={() => chooseDirection("minus")}
            >
              −
            </button>
          </div>
          {DIGITS.map((item) => (
            <button
              key={item.digit}
              type="button"
              className="keycap keycap-number keycap-square"
              style={{ gridColumn: item.column, gridRow: item.row }}
              aria-label={item.name}
              onClick={() => setState((current) => appendDigit(current, item.digit))}
            >
              {item.digit}
            </button>
          ))}
          <button
            type="button"
            className="keycap keycap-square is-action"
            style={{ gridColumn: 1, gridRow: 3 }}
            aria-label="ac, all clear"
            onClick={() => setState((current) => allClearCalculator(current))}
          >
            ac
          </button>
          <button
            type="button"
            className="keycap keycap-print keycap-span is-action"
            style={{ gridColumn: "2 / span 5", gridRow: 3 }}
            aria-label="print, calculate date"
            disabled={!printable}
            onClick={() => setState((current) => printCalculation(current, today))}
          >
            print
          </button>
          <button
            type="button"
            className="keycap keycap-square"
            style={{ gridColumn: 1, gridRow: 4 }}
            aria-label="ce, clear entry"
            onClick={() => setState((current) => clearCalculatorEntry(current))}
          >
            ce
          </button>
          <button
            type="button"
            className="keycap keycap-escape keycap-span"
            style={{ gridColumn: "2 / span 5", gridRow: 4 }}
            aria-label="escape, return to calendar"
            onClick={onEscape}
          >
            escape
          </button>
        </div>
        <p className="sr-only" role="status">
          {calculatorAnnouncement(state)}
        </p>
      </div>
    </main>
  )
}
