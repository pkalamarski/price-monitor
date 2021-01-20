import { Request, Response } from 'express'
import { Controller, Get } from '@decorators/express'

import SiteMapping from '../models/SiteMapping'

@Controller('/api/mapping')
export default class BaseController {
  @Get('/')
  async mapping(req: Request, res: Response): Promise<void> {
    const mapping = await SiteMapping.getAll()

    res.json(mapping)
  }
}