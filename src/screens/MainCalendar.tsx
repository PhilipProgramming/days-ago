import { useEffect, useState } from "react"
import { CalendarReadout } from "../components/CalendarReadout"
import { ControlPanel } from "../components/ControlPanel"
import { MarqueeLine } from "../components/MarqueeLine"
import { Wordmark } from "../components/Wordmark"
import { todayLocal, type CivilDate } from "../lib/calendar"
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

function sameCivilDate(left: CivilDate, right: CivilDate): boolean {
  return left.year === right.year && left.month === right.month && left.day === right.day
}

function useLocalToday(): CivilDate {
  const [today, setToday] = useState(() => todayLocal())

  useEffect(() => {
    const sync = () => {
      const next = todayLocal()
      setToday((current) => (sameCivilDate(current, next) ? current : next))
    }

    const id = window.setInterval(sync, 60_000)
    document.addEventListener("visibilitychange", sync)

    return () => {
      window.clearInterval(id)
      document.removeEventListener("visibilitychange", sync)
    }
  }, [])

  return today
}

export function MainCalendar() {
  const today = useLocalToday()
  const [control, setControl] = useState(INITIAL_CONTROL)
  const date = dateForControl(today, control)

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
      <p className="different-day">DIFFERENT DAY</p>
    </main>
  )
}
