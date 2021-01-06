import { Inject } from '@decorators/di'
import { Request, Response } from 'express'
import { Controller, Delete, Get, Post } from '@decorators/express'

import { logError } from '../logger'

import Products from '../models/Products'
import PriceData from '../models/PriceData'

import PriceDataService from '../services/PriceDataService'

@Controller('/api/products')
export default class BaseController {
  constructor(
    @Inject(PriceDataService) private priceDataService: PriceDataService
  ) {}

  @Get('/')
  async products(req: Request, res: Response): Promise<void> {
    const products = await Products.getAll()

    res.json(products)
  }

  @Post('/')
  async addProduct(req: Request, res: Response): Promise<void> {
    const { url, label = url, category = 'defaultCategory' } = req.body

    if (!url) {
      res.send(400)
      return
    }

    const product = await Products.create({
      label,
      url,
      category,
      createdDate: new Date(),
      updatedDate: new Date()
    })

    res.json(product)
  }

  @Delete('/')
  async deleteProduct(req: Request, res: Response): Promise<void> {
    const { productId, category } = req.body

    await Products.delete(productId, category)

    res.send(200)
  }

  @Get('/order')
  async productOrder(req: Request, res: Response): Promise<void> {
    const productOrder = await this.priceDataService.getSortedPriceData()

    res.json(productOrder)
  }

  @Get('/prices')
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
}
