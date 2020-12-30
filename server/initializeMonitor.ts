import { Container } from '@decorators/di'
import { logInfo } from './logger'
import CrawlerService from './services/CrawlerService'

import MonitorService from './services/MonitorService'

const { ENV, PRICE_JOB_CRON_TIME } = process.env

const initializeMonitor = () => {
  if (!PRICE_JOB_CRON_TIME) {
    logInfo('PRICE_JOB_CRON_TIME undefined - monitor not initialized')
    return
  }

  const monitorService = Container.get<MonitorService>(MonitorService)
  const crawlerService = Container.get<CrawlerService>(CrawlerService)

  if (ENV !== 'dev') {
    monitorService.initialize()

    monitorService.startPriceMonitor()
  } else if (ENV === 'dev') {
    crawlerService.fetchPrices()
  }
}

export default initializeMonitor
