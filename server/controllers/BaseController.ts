import { Inject } from '@decorators/di'
import { Controller, Get } from '@decorators/express'
import { Request, Response } from 'express'
import Products from '../models/Products'

import ProductService from '../services/ProductService'

@Controller('/api')
class BaseController {
  constructor(@Inject(ProductService) private productService: ProductService) {}

  @Get('/products')
  async products(req: Request, res: Response) {
    const products = await Products.getAll()

    res.json(products)
  }
}

export default BaseController
