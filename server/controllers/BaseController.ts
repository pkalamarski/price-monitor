import { Inject } from '@decorators/di'
import { Request, Response } from 'express'
import { Controller, Get } from '@decorators/express'

import { logError } from '../logger'

import Products from '../models/Products'
import PriceData from '../models/PriceData'

import MonitorService from '../services/MonitorService'
import PriceDataService from '../services/PriceDataService'

@Controller('/api')
class BaseController {
  constructor(
    @Inject(MonitorService) private monitorService: MonitorService,
    @Inject(PriceDataService) private priceDataService: PriceDataService
  ) {
    console.log(monitorService)
  }

  @Get('/products')
  async products(req: Request, res: Response): Promise<void> {
    const products = await Products.getAll()

    res.json(products)
  }

  @Get('/product-order')
  async productOrder(req: Request, res: Response): Promise<void> {
    // const productOrder = await this.priceDataService.getSortedPriceData()

    res.json({})
  }

  @Get('/product-prices')
  async productPrices(req: Request, res: Response): Promise<void> {
    const productId = req.query.productId as string

    if (!productId) {
      logError('Invalid productId')
      res.status(400).send('Invalid productId')
      return
    }

    const priceData = await PriceData.getByProductId(productId)

    res.json(priceData)
  }

  @Get('/trigger-check')
  triggerJob(req: Request, res: Response): void {
    if (req.query.key !== process.env.API_KEY) {
      logError('Invalid key')
      res.status(403).send('Invalid key')
    }

    this.monitorService.manualPriceCheck()
    res.status(200).send('OK')
  }
}

export default BaseController
