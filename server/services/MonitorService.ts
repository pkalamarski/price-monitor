import Axios from 'axios'
import { CronJob } from 'cron'
import { Inject, Injectable } from '@decorators/di'

import { logError, logInfo } from '../logger'
import CrawlerService from './CrawlerService'
import formatDate from '../utility/formatDate'

const {
  ENV,
  SERVER_URL,
  PRICE_JOB_CRON_TIME,
  HEALTH_JOB_CRON_TIME
} = process.env

@Injectable()
class MonitorService {
  public priceMonitorJob: CronJob
  public healthMonitorJob: CronJob

  constructor(@Inject(CrawlerService) private crawlerService: CrawlerService) {
    this.priceMonitorJob = this.createPriceMonitorJob()
    this.healthMonitorJob = this.createHealthMonitorJob()

    if (ENV !== 'dev') {
      this.startPriceMonitor()
      this.startHealthMonitor()
    }
  }

  async manualPriceCheck(): Promise<void> {
    logInfo(`💰 Price check triggered`)

    await this.crawlerService.fetchPrices()
  }

  private startPriceMonitor() {
    logInfo(`💰 Starting price monitor`)

    this.priceMonitorJob.start()

    logInfo(this.parseNextJobMessage(this.priceMonitorJob.nextDate().toDate()))
  }

  private startHealthMonitor() {
    logInfo('💗 Starting health monitor')

    this.healthMonitorJob.start()
  }

  private createPriceMonitorJob(): CronJob {
    const priceMonitorJob = new CronJob(PRICE_JOB_CRON_TIME, async () => {
      try {
        await this.crawlerService.fetchPrices()
      } catch (e) {
        logError('Fetching prices failed')
        logError(e)
      }
    })

    return priceMonitorJob
  }

  private createHealthMonitorJob(): CronJob {
    const healthMonitorJob = new CronJob(HEALTH_JOB_CRON_TIME, async () => {
      try {
        const { data } = await Axios.get(`${SERVER_URL}/health`)
        logInfo(`Health check: ${data}`)
      } catch (e) {
        logError('Health check failed')
        logError(e)
      }
    })

    return healthMonitorJob
  }

  private parseNextJobMessage(nextStart: Date): string {
    const minutesTillJob =
      (nextStart.getTime() - new Date().getTime()) / 1000 / 60

    return `⏭  Next job will start in ${minutesTillJob.toFixed()} minutes at ${formatDate(
      nextStart
    )}`
  }
}

export default MonitorService
