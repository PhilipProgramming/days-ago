import { SplitFlap } from "./SplitFlap"
import { accessibleCalendar, formatCalendar } from "../lib/formatDate"
import { FLAP_COLUMNS } from "../lib/splitFlap"
import type { CivilDate } from "../lib/calendar"

type CalendarReadoutProps = {
  date: CivilDate
}

export function CalendarReadout({ date }: CalendarReadoutProps) {
  const parts = formatCalendar(date)
  const revision = `${date.year}-${date.month}-${date.day}`

  return (
    <div className="readout-block">
      <p className="readout-value" aria-live="polite" aria-atomic="true">
        {accessibleCalendar(date)}
      </p>
      <dl className="readout" aria-hidden="true">
        <dt>/day</dt>
        <dd>
          <SplitFlap text={parts.day} capacity={FLAP_COLUMNS} revision={revision} row={0} />
        </dd>
        <dt>/month</dt>
        <dd>
          <SplitFlap text={parts.month} capacity={FLAP_COLUMNS} revision={revision} row={1} />
        </dd>
        <dt>/number</dt>
        <dd>
          <SplitFlap text={parts.number} capacity={FLAP_COLUMNS} revision={revision} row={2} />
        </dd>
        <dt>/year</dt>
        <dd>
          <SplitFlap text={parts.year} capacity={FLAP_COLUMNS} revision={revision} row={3} />
        </dd>
      </dl>
    </div>
  )
}
