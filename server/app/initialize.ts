import Axios from 'axios'

import getPrices from '../services/CrawlerService'

interface ILaunchTime {
  launchIn: number
  launchDate: string
}

const {
  CHECK_PRICE_INTERVAL,
  CHECK_HEALTH_INTERVAL,
  SERVER_URL,
  ENV
} = process.env

const checkPriceIntervalHours = Number(CHECK_PRICE_INTERVAL) / 60 / 60 / 1000

const initialize = async () => {
  // await initMsg(sheets)

  // const { launchIn, launchDate } = calculateLaunchTimes()

  // launchDate &&
  //   console.log(
  //     `Monitor will start in ${Math.floor(
  //       launchIn / 1000 / 60
  //     )} minutes, at ${launchDate}`
  //   )

  await getPrices()

  // setTimeout(
  //   async () => {
  //     await logAction(`Continuous price monitor started`, sheets)
  //     await getPrices(sheets)

  //     setInterval(
  //       async () => await getPrices(sheets),
  //       Number(CHECK_PRICE_INTERVAL)
  //     )
  //   },
  //   ENV !== 'dev' ? launchIn : 0
  // )

  // ENV !== 'dev' && monitorHealth(sheets)
}

// !!! Refactor \/
// const calculateLaunchTimes = (): ILaunchTime => {
//   const baseTime = new Date().setUTCMinutes(2, 0, 0)

//   const nextHour = baseTime + 60 * 60 * 1000

//   const nearestDate = baseTime - new Date().getTime() > 0 ? baseTime : nextHour

//   const launchIn = nearestDate ? nearestDate - new Date().getTime() : 0
//   const launchDate = nearestDate && formatDate(new Date(nearestDate))
//   return { launchIn, launchDate }
// }

// const monitorHealth = (sheets: sheets_v4.Sheets) =>
//   setInterval(async () => {
//     const start = new Date()
//     const { data } = await Axios.get(SERVER_URL)
//     await logAction(`Health check - ${data}`, sheets, start)
//   }, Number(CHECK_HEALTH_INTERVAL))

export default initialize
