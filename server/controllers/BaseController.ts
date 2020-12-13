import { Inject } from '@decorators/di'
import { Request, Response } from 'express'
import { Controller, Get } from '@decorators/express'

import Products from '../models/Products'
import PriceData from '../models/PriceData'

import JobService from '../services/JobService'
import { logError } from '../logger'

@Controller('/api')
class BaseController {
  constructor(@Inject(JobService) private jobService: JobService) {}

  @Get('/products')
  async products(req: Request, res: Response): Promise<void> {
    const products = await Products.getAll()

    res.json(products)
  }

  @Get('/productPrices')
  async productPrices(req: Request, res: Response): Promise<void> {
    const productId = req.query.productId as string

    if (!productId) {
      logError('Invalid productId')
      res.send('Invalid productId')
      return
    }

    const priceData = await PriceData.getByProductId(productId)

    res.json(priceData)
  }

  @Get('/trigger-monitor')
  async triggerJob(req: Request, res: Response): Promise<void> {
    if (req.query.key !== process.env.API_KEY) {
      logError('Invalid key')
      return
    }

    await this.jobService.startPriceMonitor()
  }
}

export default BaseController