import { Inject } from '@decorators/di'
import { Request, Response } from 'express'
import { Controller, Get } from '@decorators/express'

import Products from '../models/Products'
import PriceData, { IPriceData } from '../models/PriceData'

import JobService from '../services/JobService'

@Controller('/api')
class BaseController {
  constructor(@Inject(JobService) private jobService: JobService) {}

  @Get('/products')
  async products(req: Request, res: Response) {
    const products = await Products.getAll()

    res.json(products)
  }

  @Get('/productPrices')
  async productPrices(req: Request, res: Response): Promise<IPriceData> {
    const productId = req.query.productId as string

    if (!productId) return // TODO: throw error

    const priceData = await PriceData.getByProductId(productId)

    res.json(priceData)
  }

  @Get('/trigger-monitor')
  async triggerJob(req: Request, res: Response) {
    if (req.query.key !== process.env.API_KEY)
      return console.warn('Invalid key')

    await this.jobService.startPriceMonitor()
  }
}

export default BaseController
