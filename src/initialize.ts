import Axios from 'axios'
import { google, sheets_v4 } from 'googleapis'

import initializeAuth from './authorize'
import getPrices, { fullCheckHours } from './getPrices'
import { logAction, logMultiple, formatDate } from './logging'

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

const checkPriceIntervalHours = Number(CHECK_PRICE_INTERVAL) / 60 / 60 / 1000

const initialize = async () => {
  const auth = initializeAuth()

  const sheets = google.sheets({ version: 'v4', auth })

  await initMsg(sheets)

  const { launchIn, launchDate } = calculateLaunchTimes()

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
    ENV !== 'dev' ? launchIn : 0
  )

  ENV !== 'dev' && monitorHealth(sheets)
}

const calculateLaunchTimes = (): ILaunchTime => {
  const now = new Date()

  const baseTime = now.setUTCMinutes(2, 0, 0)

  const nextHour = baseTime + 60 * 60 * 1000

  const nearestDate = baseTime - now.getTime() > 0 ? baseTime : nextHour

  const launchIn = nearestDate ? nearestDate - now.getTime() : 0
  const launchDate = nearestDate && formatDate(new Date(nearestDate))
  return { launchIn, launchDate }
}

const initMsg = async (sheets: sheets_v4.Sheets) =>
  await logMultiple(
    [
      null,
      `============== price-monitor v${VERSION} ==============`,
      `Price check interval: ${checkPriceIntervalHours} hour${
        checkPriceIntervalHours > 1 ? 's' : ''
      }`,
      `Full check hours: ${fullCheckHours}`,
      `Health check interval: ${
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

export default initialize
