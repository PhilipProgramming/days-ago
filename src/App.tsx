import { useCallback, useState } from "react"
import { useLocalToday } from "./hooks/useLocalToday"
import { CalculatorScreen } from "./screens/CalculatorScreen"
import { MainCalendar } from "./screens/MainCalendar"

export function App() {
  const today = useLocalToday()
  const [screen, setScreen] = useState<"calendar" | "calculator">("calendar")
  const [returnFocus, setReturnFocus] = useState(0)

  const openCalculator = useCallback(() => {
    setScreen("calculator")
  }, [])

  const closeCalculator = useCallback(() => {
    setReturnFocus((value) => value + 1)
    setScreen("calendar")
  }, [])

  return (
    <>
      <div hidden={screen !== "calendar"}>
        <MainCalendar today={today} returnFocus={returnFocus} onDifferentDay={openCalculator} />
      </div>
      {screen === "calculator" ? <CalculatorScreen today={today} onEscape={closeCalculator} /> : null}
    </>
  )
}
