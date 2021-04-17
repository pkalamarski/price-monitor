import { CronJob } from 'cron'
import { Inject, Injectable } from '@decorators/di'

import { logError, logInfo } from '../../logger'
import timeElapsed from '../../utility/timeElapsed'
import { toLocaleString } from '../../utility/formatDate'

import ScanService from './ScanService'
import OfferService from './OfferService'
import AnalysisService from './AnalysisService'

@Injectable()
export default class FlatMonitorService {
  public flatMonitorJob: CronJob

  constructor(
    @Inject(OfferService) private offerService: OfferService,
    @Inject(ScanService) private scanService: ScanService,
    @Inject(AnalysisService) private analysisService: AnalysisService
  ) {}

  initialize(): void {
    this.flatMonitorJob = this.createFlatMonitorJob()
  }

  startFlatMonitor(): void {
    logInfo(`🏠 Starting flat monitor`)

    this.flatMonitorJob.start()

    logInfo(this.parseNextJobMessage(this.flatMonitorJob.nextDate().toDate()))
  }

  private createFlatMonitorJob(): CronJob {
    const flatMonitorJob = new CronJob('30 */6 * * *', async () => {
      try {
        await this.offerCheck()
      } catch (e) {
        logError('Checking offers failed')
        logError(e)
      }
    })

    return flatMonitorJob
  }

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

  private parseNextJobMessage(nextStart: Date): string {
    const minutesTillJob =
      (nextStart.getTime() - new Date().getTime()) / 1000 / 60

    const message = `⏭  Next flat monitor job will start in ${minutesTillJob.toFixed()} minutes at ${toLocaleString(
      nextStart
    )}`

    return message
  }
}
