// Helpers to correctly convert between <input type="date"/"time"> local values
// (which have no timezone information) and the ISO/UTC strings the API expects.
//
// The bug this fixes: naively building `${date}T${time}:00.000Z` tells JavaScript
// the value is ALREADY in UTC, but the date/time the user typed is their local
// wall-clock time. That silently shifts every reservation by the local UTC offset
// (e.g. 3h in Brazil). The functions below always go through the Date constructor's
// (year, month, day, hours, minutes) form, which is unambiguously local time in
// every JS engine, and only call toISOString() once, at the boundary to the API.

export function combineLocalDateAndTimeToISO(dateStr: string, timeStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number)
  const [hours, minutes] = timeStr.split(":").map(Number)
  return new Date(year, month - 1, day, hours, minutes, 0, 0).toISOString()
}

export function localDateOnlyToISO(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(year, month - 1, day, 0, 0, 0, 0).toISOString()
}

export function toLocalDateInputValue(isoString: string): string {
  const d = new Date(isoString)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function toLocalTimeInputValue(isoString: string): string {
  const d = new Date(isoString)
  const hours = String(d.getHours()).padStart(2, "0")
  const minutes = String(d.getMinutes()).padStart(2, "0")
  return `${hours}:${minutes}`
}

export function toLocalDateTimeInputValue(isoString: string): string {
  return `${toLocalDateInputValue(isoString)}T${toLocalTimeInputValue(isoString)}`
}

export function combineLocalDateTimeInputToISO(dateTimeLocalValue: string): string {
  const [datePart, timePart] = dateTimeLocalValue.split("T")
  return combineLocalDateAndTimeToISO(datePart, timePart ?? "00:00")
}

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const MONTH_LABELS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

export function getWeekdayLabels() {
  return WEEKDAY_LABELS
}

export function getMonthLabel(month: number) {
  return MONTH_LABELS[month]
}

/** Generates "HH:mm" options in fixed-minute increments across a full day. */
export function generateTimeOptions(stepMinutes = 30): string[] {
  const options: string[] = []
  for (let minutes = 0; minutes < 24 * 60; minutes += stepMinutes) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    options.push(`${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`)
  }
  return options
}
