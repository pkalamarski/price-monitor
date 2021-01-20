import { Request, Response } from 'express'
import { Controller, Get, Post } from '@decorators/express'

import SiteMapping from '../models/SiteMapping'

@Controller('/api/mapping')
export default class BaseController {
  @Get('/')
  async mapping(req: Request, res: Response): Promise<void> {
    const mapping = await SiteMapping.getAll()

    res.json(mapping.reverse())
  }

  @Post('/')
  async addMapping(req: Request, res: Response): Promise<void> {
    const {
      host,
      priceSelector,
      usePuppeteer = false,
      isMetaTag = false
    } = req.body

    if (!host || !priceSelector) {
      res.sendStatus(400)
      return
    }

    try {
      await SiteMapping.create({
        host,
        priceSelector,
        usePuppeteer,
        isMetaTag
      })
    } catch {
      // ignore error
    }

    res.sendStatus(200)
  }
}
