import { Inject } from '@decorators/di'
import { Response } from 'express'
import { Controller, Get } from '@decorators/express'

import { AuthRequest } from '../auth'

import FlatMonitorService from '../services/flat-monitor/FlatMonitorService'

@Controller('/api/flat')
export default class BaseController {
  constructor(
    @Inject(FlatMonitorService) private flatMonitorService: FlatMonitorService
  ) {}

  @Get('/check')
  async offerCheck(_req: AuthRequest, res: Response) {
    await this.flatMonitorService.offerCheck()

    res.sendStatus(200)
  }
}
