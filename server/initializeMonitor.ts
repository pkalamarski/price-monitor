import { Container } from '@decorators/di'

import { logInfo } from './logger'

import CrawlerService from './services/price-monitor/CrawlerService'
import FlatMonitorService from './services/flat-monitor/FlatMonitorService'
import PriceMonitorService from './services/price-monitor/PriceMonitorService'

const { ENV, PRICE_JOB_CRON_TIME } = process.env

const initializeMonitor = (): void => {
  if (!PRICE_JOB_CRON_TIME) {
    logInfo('PRICE_JOB_CRON_TIME undefined - monitor not initialized')
    return
  }

  const flatMonitorService = Container.get<FlatMonitorService>(
    FlatMonitorService
  )
  const priceMonitorService = Container.get<PriceMonitorService>(
    PriceMonitorService
  )
  const crawlerService = Container.get<CrawlerService>(CrawlerService)

  if (ENV !== 'dev') {
    flatMonitorService.initialize()
    priceMonitorService.initialize()

    flatMonitorService.startFlatMonitor()
    priceMonitorService.startPriceMonitor()
  } else if (ENV === 'dev') {
    crawlerService.fetchPrices()
  }
}

export default initializeMonitor
