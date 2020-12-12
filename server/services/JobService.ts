import Axios from 'axios'
import { CronJob } from 'cron'
import { Inject, Injectable } from '@decorators/di'

import CrawlerService from './CrawlerService'

const {
  PRICE_JOB_CRON_TIME,
  HEALTH_JOB_CRON_TIME,
  SERVER_URL,
  ENV
} = process.env

@Injectable()
class JobService {
  constructor(@Inject(CrawlerService) private crawlerService: CrawlerService) {}

  async startPriceMonitor() {
    console.info('Starting price monitor')

    if (ENV === 'dev') {
      await this.crawlerService.fetchPrices()
      return
    }

    const priceMonitorJob = new CronJob(PRICE_JOB_CRON_TIME, async () => {
      await this.crawlerService.fetchPrices()
    })

    priceMonitorJob.start()
    this.monitorHealth()
  }

  private monitorHealth() {
    new CronJob(HEALTH_JOB_CRON_TIME, async () => {
      const start = new Date()
      const { data } = await Axios.get(SERVER_URL + '/health')
      console.log(`Health check: ${data}`)
      // Log check
    }).start()
  }
}

export default JobService
