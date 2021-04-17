import { Inject } from '@decorators/di'
import { Response } from 'express'
import { Controller, Get } from '@decorators/express'

import { AuthRequest } from '../auth'

import FlatMonitorService from '../services/flat-monitor/FlatMonitorService'
import AnalysisService from '../services/flat-monitor/AnalysisService'

@Controller('/api/flat')
export default class BaseController {
  constructor(
    @Inject(FlatMonitorService) private flatMonitorService: FlatMonitorService,
    @Inject(AnalysisService) private analysisService: AnalysisService
  ) {}

  @Get('/offers')
  async matchingOffers(_req: AuthRequest, res: Response): Promise<void> {
    const matchingOffers = await this.analysisService.getMatchingOffers()

    res.json(matchingOffers)
  }

  @Get('/check')
  async triggerOfferCheck(_req: AuthRequest, res: Response): Promise<void> {
    await this.flatMonitorService.offerCheck()

    res.sendStatus(200)
  }
}
