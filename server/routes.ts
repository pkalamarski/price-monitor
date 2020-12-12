import { attachControllers } from '@decorators/express'
import { Router } from 'express'

import BaseController from './controllers/BaseController'

const router = Router()

attachControllers(router, [BaseController])

export default router
