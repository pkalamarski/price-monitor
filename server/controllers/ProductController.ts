import { Inject } from '@decorators/di'
import { Request, Response } from 'express'
import { Controller, Delete, Get, Patch, Post } from '@decorators/express'

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

    res.json(products.reverse())
  }

  @Post('/')
  async addProduct(req: Request, res: Response): Promise<void> {
    const { url, label, category = 'defaultCategory' } = req.body

    if (!url || !label) {
      res.sendStatus(400)
      return
    }

    try {
      await Products.create({
        label,
        url,
        category
      })
    } catch {
      // ignore error
    }

    res.sendStatus(200)
  }

  @Delete('/')
  async deleteProduct(req: Request, res: Response): Promise<void> {
    const { productId, category } = req.body

    await Products.delete(productId, category)

    res.sendStatus(200)
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

  @Get('/all-prices')
  async allPrices(req: Request, res: Response): Promise<void> {
    const priceData = await PriceData.getAll()

    res.json(priceData)
  }

  @Get('/categories')
  async categories(req: Request, res: Response): Promise<void> {
    const products = await Products.getAll()
    const categories = [...new Set(products.map((p) => p.category))]

    res.json(categories)
  }

  @Patch('/:productId/category')
  async changeCategory(req: Request, res: Response): Promise<void> {
    const productId = req.params.productId as string
    const newCategory = req.body.category as string

    const product = await Products.getById(productId)

    await Products.delete(product.id, product.category)

    await Products.upsert({
      ...product,
      category: newCategory
    })

    res.sendStatus(201)
  }
}
