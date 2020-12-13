const formatDate = (date: Date): string =>
  date.toLocaleString('en-GB', {
    timeZone: 'Europe/Warsaw'
  })

export default formatDate
