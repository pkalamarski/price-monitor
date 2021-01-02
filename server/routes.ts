import { Router } from 'express'
import { attachControllers } from '@decorators/express'

import BaseController from './controllers/BaseController'
import AuthController from './controllers/AuthController'
import ProductController from './controllers/ProductController'

const router = Router()

attachControllers(router, [BaseController, AuthController, ProductController])

export default router
