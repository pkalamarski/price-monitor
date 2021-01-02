import jwt from 'jsonwebtoken'
import { NextFunction, Request, Response } from 'express'
import { IUser } from './models/Users'

const routes = [
  /^\/health/,
  /^\/api\/auth\/login/,
  /^\/api\/auth\/logout/,
  /^\/login/,

  /^\/favicon.*.ico/,
  /^\/client.*.css/,
  /^\/client.*.js/
]

const { COOKIE, ACCESS_TOKEN_SECRET } = process.env

export interface AuthRequest extends Request {
  user: Omit<IUser, 'hash'>
}

const auth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (routes.some((route) => route.test(req.path))) return next()

  const token = req.cookies[COOKIE]

  if (token) {
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403)
      }

      req.user = user

      next()
    })
  } else {
    res.redirect('/login')
  }
}

export default auth
