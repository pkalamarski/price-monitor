import { Inject } from '@decorators/di'
import { Request, Response } from 'express'
import { Controller, Get } from '@decorators/express'

import { logError } from '../logger'
import { AuthRequest } from '../auth'

import MonitorService from '../services/MonitorService'

@Controller('/api')
export default class BaseController {
  constructor(@Inject(MonitorService) private monitorService: MonitorService) {}

  @Get('/user')
  user(req: AuthRequest, res: Response): void {
    res.json(req.user || {})
  }

  @Get('/trigger-check')
  triggerJob(req: Request, res: Response): void {
    if (req.query.key !== process.env.API_KEY) {
      logError('Invalid key')
      res.status(403).send('Invalid key')
      return
    }

    this.monitorService.manualPriceCheck()
    res.status(200).send('OK')
  }
}
