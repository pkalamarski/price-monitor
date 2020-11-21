import Axios from 'axios'
import { google } from 'googleapis'

import initializeAuth from './authorize'
import { checkPrices } from './dataHandling'
import { getItemUrls, writePrices } from './sheetDataHandling'
import { addNewColumn, getNewColumnName } from './sheetSchemaHandling'
import { logAction, logMultiple, generateReport, formatDate } from './logging'

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
      await getPrices(sheets)

      setInterval(
        async () => await getPrices(sheets),
        Number(CHECK_PRICE_INTERVAL)
      )
    },
    ENV === 'prod' ? launchIn : 1
  )

  monitorHealth(sheets)
}

const getPrices = async (sheets) => {
  const startTime = new Date()

  await logMultiple([null, 'JOB: Starting price check job'], sheets)

  const newColumnName = await getNewColumnName(sheets)

  const urls = await getItemUrls(sheets)

  await addNewColumn(sheets)

  const prices = await checkPrices(urls, sheets)

  await writePrices(sheets, prices, newColumnName)

  await generateReport(prices, sheets)

  const validUrls = urls.filter((url) => url !== '-')
  const elapsedSeconds = (
    (new Date().getTime() - startTime.getTime()) /
    1000
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

const calculateLaunchTime = () => {
  const runTimes = [1, 5, 9, 13, 17, 21].map((hour) =>
    new Date().setHours(hour, 2, 0)
  )

  const nearestDate = runTimes.find((date) => date - new Date().getTime() > 0)

  const launchIn = nearestDate ? nearestDate - new Date().getTime() : 0
  const launchDate = nearestDate && formatDate(new Date(nearestDate))
  return { launchIn, launchDate }
}

const initMsg = async (sheets) =>
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

const monitorHealth = (sheets) =>
  setInterval(async () => {
    const start = new Date()
    const { data } = await Axios.get(SERVER_URL)
    await logAction(`Health check - ${data}`, sheets, start)
  }, Number(CHECK_HEALTH_INTERVAL))

const calculateAverageTime = (prices) => {
  const times = prices.map((p) => p.time).filter(Boolean)

  const high = times.sort((a, b) => b - a)[0]
  const avg = times.reduce((sum, t) => sum + t) / times.length
  const low = times.sort((a, b) => a - b)[0]

  return { high: formatTime(high), avg: formatTime(avg), low: formatTime(low) }
}

const formatTime = (ms) => (ms / 1000).toFixed(2)

export default initialize
