import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Inject } from '@decorators/di'
import { Request, Response } from 'express'
import { Controller, Get, Post } from '@decorators/express'

import { logError, logInfo } from '../logger'

import Users from '../models/Users'
import Products from '../models/Products'
import PriceData from '../models/PriceData'

import MonitorService from '../services/MonitorService'
import PriceDataService from '../services/PriceDataService'

const { COOKIE, ACCESS_TOKEN_SECRET } = process.env

@Controller('/api')
export default class BaseController {
  constructor(
    @Inject(MonitorService) private monitorService: MonitorService,
    @Inject(PriceDataService) private priceDataService: PriceDataService
  ) {}

  @Get('/user')
  user(req: any, res: Response): void {
    res.json(req.user || {})
  }

  @Post('/login')
  async login(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body

    const user = await Users.getOne({ username })

    const userPasswordMatch = bcrypt.compareSync(password, user.hash)

    if (user && userPasswordMatch) {
      const token = jwt.sign(
        {
          fullName: user.fullName,
          username: user.username,
          role: user.role,
          lastLogin: user.lastLogin
        },
        ACCESS_TOKEN_SECRET,
        { expiresIn: '7d' }
      )

      await Users.accessItem(user.id, user.username).replace({
        ...user,
        lastLogin: new Date()
      })

      res.cookie(COOKIE, token, {
        httpOnly: true,
        expires: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7)
      })

      res.json({
        token
      })
    } else {
      res.status(400).send('Username or password incorrect')
    }
  }

  @Post('/logout')
  async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie(COOKIE)
    res.send()
  }

  @Get('/products')
  async products(req: Request, res: Response): Promise<void> {
    const products = await Products.getAll()

    res.json(products)
  }

  @Get('/product-order')
  async productOrder(req: Request, res: Response): Promise<void> {
    const productOrder = await this.priceDataService.getSortedPriceData()

    res.json(productOrder)
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
