import { useEffect, useRef, useState } from "react"
import { CalendarReadout } from "../components/CalendarReadout"
import { ControlPanel } from "../components/ControlPanel"
import { MarqueeLine } from "../components/MarqueeLine"
import { Wordmark } from "../components/Wordmark"
import type { CivilDate } from "../lib/calendar"
import {
  INITIAL_CONTROL,
  allClear,
  check,
  clearEntry,
  dateForControl,
  selectCount,
  selectDirection,
} from "../lib/controlPanel"
import { tomorrowSentence, yesterdaySentence } from "../lib/formatDate"

type MainCalendarProps = {
  today: CivilDate
  returnFocus: number
  onDifferentDay: () => void
}

export function MainCalendar({ today, returnFocus, onDifferentDay }: MainCalendarProps) {
  const differentDayRef = useRef<HTMLButtonElement>(null)
  const [control, setControl] = useState(INITIAL_CONTROL)
  const date = dateForControl(today, control)

  useEffect(() => {
    if (returnFocus === 0) return
    differentDayRef.current?.focus({ preventScroll: true })
  }, [returnFocus])

  return (
    <main className="calendar-screen">
      <Wordmark />
      <div className="marquee-band">
        <div className="rail" aria-hidden="true" />
        <div className="marquee-track">
          <MarqueeLine align="end" text={yesterdaySentence(today)} />
        </div>
        <div className="rail" aria-hidden="true" />
        <div className="marquee-track">
          <MarqueeLine align="start" text={tomorrowSentence(today)} />
        </div>
        <div className="rail" aria-hidden="true" />
      </div>
      <div className="calendar-stage">
        <CalendarReadout date={date} />
        <ControlPanel
          direction={control.direction}
          count={control.count}
          onDirection={(direction) => setControl((current) => selectDirection(current, direction))}
          onCount={(value) => setControl((current) => selectCount(current, value))}
          onCheck={() => setControl((current) => check(current))}
          onAllClear={() => setControl((current) => allClear(current))}
          onClearEntry={() => setControl((current) => clearEntry(current))}
        />
      </div>
      <button
        ref={differentDayRef}
        type="button"
        className="keycap keycap-different different-day"
        onClick={onDifferentDay}
      >
        different day
      </button>
    </main>
  )
}
