import Axios from 'axios'
import { CronJob } from 'cron'
import { Inject, Injectable } from '@decorators/di'

import { logError, logInfo } from '../../logger'
import CrawlerService from './CrawlerService'
import { toLocaleString } from '../../utility/formatDate'

const { SERVER_URL, PRICE_JOB_CRON_TIME, HEALTH_JOB_CRON_TIME } = process.env

@Injectable()
export default class PriceMonitorService {
  public priceMonitorJob: CronJob
  public healthMonitorJob: CronJob

  constructor(@Inject(CrawlerService) private crawlerService: CrawlerService) {}

  initialize(): void {
    this.priceMonitorJob = this.createPriceMonitorJob()
    this.healthMonitorJob = this.createHealthMonitorJob()
  }

  startPriceMonitor(): void {
    logInfo(`💰 Starting price monitor`)

    this.priceMonitorJob.start()
    this.startHealthMonitor()

    logInfo(this.parseNextJobMessage(this.priceMonitorJob.nextDate().toDate()))
  }

  async manualPriceCheck(): Promise<void> {
    logInfo(`💰 Price check triggered`)

    await this.crawlerService.fetchPrices()
  }

  private startHealthMonitor(): void {
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

        if (this.priceMonitorJob.running) {
          logInfo(`Health check ${data}: monitor is up`)
        } else {
          logError('Monitor is down, attempting restart...')
          this.priceMonitorJob.start()
        }
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

    return `⏭  Next price monitor job will start in ${minutesTillJob.toFixed()} minutes at ${toLocaleString(
      nextStart
    )}`
  }
}
