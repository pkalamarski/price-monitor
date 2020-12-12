import { Inject } from '@decorators/di'
import { Controller, Get } from '@decorators/express'
import { Request, Response } from 'express'

import Products from '../models/Products'
import PriceData, { IPriceData } from '../models/PriceData'

import ProductService from '../services/ProductService'

@Controller('/api')
class BaseController {
  constructor(@Inject(ProductService) private productService: ProductService) {}

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
}

export default BaseController
