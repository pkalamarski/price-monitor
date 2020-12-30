export const toLocaleString = (date: Date): string =>
  date.toLocaleString('en-GB', {
    timeZone: 'Europe/Warsaw'
  })

export const shortDate = (date: Date): string =>
  date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Europe/Warsaw'
  })
