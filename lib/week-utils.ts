// Week calculation utilities for Monday-Sunday weekly periods.
// Shared between server (API routes) and client (submit form).
// No Node.js-only imports — safe for both environments.

export interface WeekRange {
  weekNumber: number
  startDate: Date // Monday
  endDate: Date // Sunday
  label: string // e.g. "Week 1 — Mar 2-8"
}

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/**
 * Calculate the Monday-Sunday weeks for a given month/year.
 *
 * Business rule: weeks run Monday to Sunday. A week belongs to the month
 * its Monday falls in, even if its Sunday spills into the next month.
 *
 * Week 1 starts on the first Monday on or after the 1st of the month.
 * Subsequent weeks are +7 days. We keep adding weeks as long as the
 * Monday still falls within the given month.
 *
 * @param year  - Full year (e.g. 2026)
 * @param month - 1-indexed month (1=Jan, 12=Dec)
 */
export function getWeeksForMonth(year: number, month: number): WeekRange[] {
  // month is 1-indexed; JS Date uses 0-indexed months
  const firstOfMonth = new Date(year, month - 1, 1)

  // Find the first Monday on or after the 1st
  const firstMonday = new Date(firstOfMonth)
  const dow = firstMonday.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
  if (dow === 0) {
    // Sunday — next Monday is tomorrow
    firstMonday.setDate(firstMonday.getDate() + 1)
  } else if (dow !== 1) {
    // Not Monday — advance to next Monday
    firstMonday.setDate(firstMonday.getDate() + (8 - dow))
  }
  // dow === 1 means the 1st is already a Monday; no adjustment needed

  const weeks: WeekRange[] = []
  const monday = new Date(firstMonday)
  let weekNum = 1

  // Keep adding weeks as long as the Monday is still in this month
  while (monday.getMonth() === month - 1) {
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    const startMonth = MONTH_NAMES[monday.getMonth()]
    const endMonth = MONTH_NAMES[sunday.getMonth()]

    let label: string
    if (startMonth === endMonth) {
      label = `Week ${weekNum} \u2014 ${startMonth} ${monday.getDate()}-${sunday.getDate()}`
    } else {
      label = `Week ${weekNum} \u2014 ${startMonth} ${monday.getDate()} - ${endMonth} ${sunday.getDate()}`
    }

    weeks.push({
      weekNumber: weekNum,
      startDate: new Date(monday),
      endDate: sunday,
      label,
    })

    weekNum++
    monday.setDate(monday.getDate() + 7)
  }

  return weeks
}

/**
 * Determine which week number a given date falls into for the specified month.
 *
 * Returns the 1-based week number, or 0 if the date falls before the first
 * Monday of the month (meaning it belongs to the previous month's last week).
 *
 * @param date  - The date to check
 * @param year  - Full year
 * @param month - 1-indexed month
 */
export function getCurrentWeekNumber(
  date: Date,
  year: number,
  month: number
): number {
  const weeks = getWeeksForMonth(year, month)
  const dateTime = date.getTime()

  for (const week of weeks) {
    const endOfSunday = new Date(week.endDate)
    endOfSunday.setHours(23, 59, 59, 999)

    if (dateTime >= week.startDate.getTime() && dateTime <= endOfSunday.getTime()) {
      return week.weekNumber
    }
  }

  // Date is before the first Monday (e.g. the 1st-3rd when the 1st is Thursday).
  // It belongs to the previous month's last week. Return 0 to signal this.
  return 0
}
