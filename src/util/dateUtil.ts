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
