import { Inject, Injectable } from '@decorators/di'

import { logInfo } from '../../logger'

import ScanService from './ScanService'
import OfferService from './OfferService'
import AnalysisService from './AnalysisService'
import timeElapsed from '../../utility/timeElapsed'

@Injectable()
export default class FlatMonitorService {
  constructor(
    @Inject(OfferService) private offerService: OfferService,
    @Inject(ScanService) private scanService: ScanService,
    @Inject(AnalysisService) private analysisService: AnalysisService
  ) {}

  async offerCheck() {
    logInfo('JOB: Starting offer check job')
    const startTime = new Date()

    const allOffers = await this.offerService.getAllActiveOffers()

    const pagesToScan = await this.scanService.excludeCheckedPages(allOffers)
    const pagesData = await this.scanService.scanOffers(pagesToScan)
    await this.analysisService.analysePages(pagesData)

    const elapsed = timeElapsed(startTime)

    logInfo(
      `SUCCESS: ${pagesToScan.length} offers scanned in ${(
        elapsed / 1000
      ).toFixed(1)} seconds`
    )
  }
}
