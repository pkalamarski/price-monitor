import Axios from 'axios'
import { google, sheets_v4 } from 'googleapis'

import initializeAuth from './authorize'
import { checkPrices } from './dataHandling'
import { addNewColumn, getColumnNames } from './sheetSchemaHandling'
import { getItems, IPrice, writePrices } from './sheetDataHandling'
import {
  logAction,
  logMultiple,
  generateReport,
  formatDate,
  calculateTimeDiff
} from './logging'

interface ILaunchTime {
  launchIn: number
  launchDate: string
}

const {
  CHECK_PRICE_INTERVAL,
  CHECK_HEALTH_INTERVAL,
  SERVER_URL,
  ENV,
  VERSION
} = process.env

const initialize = async () => {
  const auth = initializeAuth()

  const sheets = google.sheets({ version: 'v4', auth })

  await initMsg(sheets)

  const { launchIn, launchDate } = calculateLaunchTime()

  if (launchDate) {
    await logAction(`Monitor will start at ${launchDate}`, sheets)
  }

  setTimeout(
    async () => {
      await getPrices(sheets, false)

      setInterval(
        async () => await getPrices(sheets, false),
        Number(CHECK_PRICE_INTERVAL)
      )
    },
    ENV !== 'dev' ? launchIn : 0
  )

  ENV !== 'dev' && monitorHealth(sheets)
}

const getPrices = async (sheets: sheets_v4.Sheets, silentRun: boolean) => {
  const startTime = new Date()

  await logMultiple(
    [null, `JOB: ${silentRun ? 'Silent price' : 'Price'} check`],
    sheets
  )

  const { lastColumnName, newColumnName } = await getColumnNames(sheets)

  const items = await getItems(sheets, lastColumnName)

  const prices = await checkPrices(items, sheets)

  const skipWrite =
    prices.every((item) => item.oldPrice === item.newPrice) && silentRun

  if (skipWrite) {
    await logAction(
      'No price changes detected - data will not be saved',
      sheets
    )
  } else {
    await addNewColumn(sheets)
    await writePrices(sheets, prices, newColumnName)
  }

  await generateReport(prices, sheets, skipWrite)

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

const calculateLaunchTime = (): ILaunchTime => {
  const runTimes = [1, 5, 9, 13, 17, 21].map((hour) =>
    new Date().setUTCHours(hour, 2, 0)
  )

  const nearestDate = runTimes.find((date) => date - new Date().getTime() > 0)

  const launchIn = nearestDate ? nearestDate - new Date().getTime() : 0
  const launchDate = nearestDate && formatDate(new Date(nearestDate))
  return { launchIn, launchDate }
}

const initMsg = async (sheets: sheets_v4.Sheets) =>
  await logMultiple(
    [
      null,
      `============== price-monitor v${VERSION} ==============`,
      `CHECK_PRICE_INTERVAL: ${
        Number(CHECK_PRICE_INTERVAL) / 60 / 60 / 1000
      } hours`,
      `CHECK_HEALTH_INTERVAL: ${
        Number(CHECK_HEALTH_INTERVAL) / 60 / 1000
      } minutes`,
      null
    ],
    sheets
  )

const monitorHealth = (sheets: sheets_v4.Sheets) =>
  setInterval(async () => {
    const start = new Date()
    const { data } = await Axios.get(SERVER_URL)
    await logAction(`Health check - ${data}`, sheets, start)
  }, Number(CHECK_HEALTH_INTERVAL))

const calculateAverageTime = (prices: IPrice[]) => {
  const times = prices.map((p) => p.time).filter(Boolean)

  const high = times.sort((a, b) => b - a)[0]
  const avg = times.reduce((sum, t) => sum + t) / times.length
  const low = times.sort((a, b) => a - b)[0]

  return { high: formatTime(high), avg: formatTime(avg), low: formatTime(low) }
}

const formatTime = (ms: number) => (ms / 1000).toFixed(2)

export default initialize
