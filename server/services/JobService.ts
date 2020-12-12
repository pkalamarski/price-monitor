import CrawlerService from './CrawlerService'
import { CronJob } from 'cron'
import { Injectable } from '@decorators/di'
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

@Injectable()
class JobService {
  async priceCheck() {
    // await initMsg(sheets)

    // await CrawlerService.fetchPrices()

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

    const priceMonitorJob = new CronJob('* * * * * *', () => {
      console.log('lol')
    })

    // ENV !== 'dev' && monitorHealth(sheets)
  }
}

export default JobService

// const monitorHealth = (sheets: sheets_v4.Sheets) =>
//   setInterval(async () => {
//     const start = new Date()
//     const { data } = await Axios.get(SERVER_URL)
//     await logAction(`Health check - ${data}`, sheets, start)
//   }, Number(CHECK_HEALTH_INTERVAL))
