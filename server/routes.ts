import { Router } from 'express'
import { attachControllers } from '@decorators/express'

import BaseController from './controllers/BaseController'
import FlatController from './controllers/FlatController'
import AuthController from './controllers/AuthController'
import ProductController from './controllers/ProductController'
import MappingController from './controllers/MappingController'

const router = Router()

attachControllers(router, [
  BaseController,
  AuthController,
  ProductController,
  MappingController,
  FlatController
])

export default router
