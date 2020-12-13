import Axios from 'axios'
import { CronJob } from 'cron'
import { Inject, Injectable } from '@decorators/di'

import { logInfo } from '../logger'
import CrawlerService from './CrawlerService'
import formatDate from '../utility/formatDate'

const {
  ENV,
  SERVER_URL,
  PRICE_JOB_CRON_TIME,
  HEALTH_JOB_CRON_TIME
} = process.env

@Injectable()
class JobService {
  constructor(@Inject(CrawlerService) private crawlerService: CrawlerService) {}

  async startPriceMonitor(): Promise<void> {
    logInfo(`Starting price monitor in ${ENV} mode`)

    if (ENV === 'dev') {
      await this.crawlerService.fetchPrices()
      return
    }

    const priceMonitorJob = new CronJob(PRICE_JOB_CRON_TIME, async () => {
      await this.crawlerService.fetchPrices()
    })

    priceMonitorJob.start()
    this.monitorHealth()

    logInfo(this.parseNextJobMessage(priceMonitorJob.nextDate().toDate()))
  }

  private monitorHealth() {
    new CronJob(HEALTH_JOB_CRON_TIME, async () => {
      const { data } = await Axios.get(`${SERVER_URL}/health`)
      logInfo(`Health check: ${data}`)
    }).start()
  }

  private parseNextJobMessage(nextStart: Date): string {
    const minutesTillJob =
      (nextStart.getTime() - new Date().getTime()) / 1000 / 60

    return `Next job will start in ${minutesTillJob.toFixed()} minutes at ${formatDate(
      nextStart
    )}`
  }
}

export default JobService
