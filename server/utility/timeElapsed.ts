export default (startDate: Date): number =>
  new Date().getTime() - startDate.getTime()
