import jwt from 'jsonwebtoken'
import { NextFunction, Request, Response } from 'express'

const routes = [
  /^\/health/,
  /^\/api\/login/,
  /^\/api\/logout/,
  /^\/login/,

  /^\/favicon.*.ico/,
  /^\/client.*.css/,
  /^\/client.*.js/
]

const { COOKIE, ACCESS_TOKEN_SECRET } = process.env

interface AuthRequest extends Request {
  user: any
}

const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
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
