export function normalizeToDateOnly(value: Date) {
  // Strip the time portion so comparisons are based on the calendar day.
  const normalized = new Date(value)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

export function parseDueDate(value?: string | null) {
  // Return early for empty values so callers do not get a bogus date.
  if (!value) {
    return null
  }

  const trimmedValue = value.trim()

  // Support ISO-style dates such as "2026-08-02" or "2026-08-02T00:00:00.000Z".
  const isoDateMatch = trimmedValue.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T\s].*)?$/,
  )
  if (isoDateMatch) {
    const [, yearText, monthText, dayText] = isoDateMatch
    const parsedYear = Number(yearText)
    const parsedMonth = Number(monthText) - 1
    const parsedDay = Number(dayText)

    if (
      !Number.isNaN(parsedYear) &&
      !Number.isNaN(parsedMonth) &&
      !Number.isNaN(parsedDay)
    ) {
      return normalizeToDateOnly(new Date(parsedYear, parsedMonth, parsedDay))
    }
  }

  // Support backend-style display dates such as "31 July 2026".
  const dayMonthYearMatch = trimmedValue.match(
    /^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})$/,
  )
  if (dayMonthYearMatch) {
    const [, dayText, monthText, yearText] = dayMonthYearMatch
    const parsedMonth = new Date(`${monthText} 1, 2000`).getMonth()
    const parsedDay = Number(dayText)
    const parsedYear = Number(yearText)

    if (
      !Number.isNaN(parsedMonth) &&
      !Number.isNaN(parsedDay) &&
      !Number.isNaN(parsedYear)
    ) {
      const normalized = new Date(parsedYear, parsedMonth, parsedDay)
      return normalizeToDateOnly(normalized)
    }
  }

  // Fallback for any other date string that the browser can parse.
  const parsedDate = new Date(trimmedValue)
  if (!Number.isNaN(parsedDate.getTime())) {
    return normalizeToDateOnly(parsedDate)
  }

  return null
}

export function formatDueDateForDisplay(value?: string | null) {
  const parsedDate = parseDueDate(value)
  if (!parsedDate) {
    return null
  }

  return parsedDate.toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function getDateString() {
  const date = new Date()
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function getTimeOfDay() {
  const date = new Date()
  const hour = date.getHours()

  if (hour >= 5 && hour < 12) {
    return 'Morning'
  } else if (hour >= 12 && hour < 17) {
    return 'Afternoon'
  } else {
    return 'Evening'
  }
}
