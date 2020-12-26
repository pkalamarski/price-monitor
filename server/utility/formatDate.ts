export const toLocaleString = (date: Date): string =>
  date.toLocaleString('en-GB', {
    timeZone: 'Europe/Warsaw'
  })

export const shortDate = (date: Date, delimiter = '/'): string =>
  [date.getDay(), date.getMonth() + 1, date.getFullYear()].join(delimiter)
