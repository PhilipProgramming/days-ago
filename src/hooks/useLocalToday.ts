import { useEffect, useState } from "react"
import { todayLocal, type CivilDate } from "../lib/calendar"

function sameCivilDate(left: CivilDate, right: CivilDate): boolean {
  return left.year === right.year && left.month === right.month && left.day === right.day
}

export function useLocalToday(): CivilDate {
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
