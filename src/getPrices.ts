import { sheets_v4 } from 'googleapis'

import {
  logAction,
  logMultiple,
  generateReport,
  calculateTimeDiff
} from './logging'
import { checkPrices } from './dataHandling'
import { getItems, IPrice, writePrices } from './sheetDataHandling'
import { addNewColumn, getColumnNames } from './sheetSchemaHandling'

export const fullCheckHours = process.env.FULL_CHECK_HOURS.split(',').map(
  Number
)

const getPrices = async (sheets: sheets_v4.Sheets) => {
  const startTime = new Date()
  const silentCheck = isSilentCheck()

  await logMultiple(
    [null, `JOB: Price check${silentCheck ? ' - silent run' : ''}`],
    sheets
  )

  const { lastColumnName, newColumnName } = await getColumnNames(sheets)

  const items = await getItems(sheets, lastColumnName)

  const prices = await checkPrices(items, sheets)

  const skipWrite =
    prices.every((item) => item.oldPrice === item.newPrice) && silentCheck

  if (skipWrite) {
    await logAction('No price changes detected - no data column added', sheets)
  } else {
    await addNewColumn(sheets)
    await writePrices(sheets, prices, newColumnName)
  }

  await generateReport(prices, sheets, silentCheck, skipWrite)

  const validUrls = items.filter((item) => item.url !== '-')
  const elapsedSeconds = (
    calculateTimeDiff({ start: startTime }) / 1000
  ).toFixed(1)
  const { high, avg, low } = calculateAverageTime(prices)

  await logMultiple(
    [
      `Time report: high: ${high}s, avg: ${avg}s, low: ${low}s`,
      `SUCCESS: ${validUrls.length} prices checked in ${elapsedSeconds} seconds`,
      null
    ],
    sheets
  )
}

const isSilentCheck = (): boolean =>
  !fullCheckHours.includes(new Date().getUTCHours())

const calculateAverageTime = (prices: IPrice[]) => {
  const times = prices.map((p) => p.time).filter(Boolean)

  const high = times.sort((a, b) => b - a)[0]
  const avg = times.reduce((sum, t) => sum + t) / times.length
  const low = times.sort((a, b) => a - b)[0]

  return { high: formatTime(high), avg: formatTime(avg), low: formatTime(low) }
}

const formatTime = (ms: number) => (ms / 1000).toFixed(2)

export default getPrices
