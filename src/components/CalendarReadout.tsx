import { formatCalendar } from "../lib/formatDate"
import type { CivilDate } from "../lib/calendar"

type CalendarReadoutProps = {
  date: CivilDate
}

export function CalendarReadout({ date }: CalendarReadoutProps) {
  const parts = formatCalendar(date)

  return (
    <dl className="readout">
      <dt>/day</dt>
      <dd>{parts.day}</dd>
      <dt>/month</dt>
      <dd>{parts.month}</dd>
      <dt>/number</dt>
      <dd>{parts.number}</dd>
      <dt>/year</dt>
      <dd>{parts.year}</dd>
    </dl>
  )
}
