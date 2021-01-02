import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Request, Response } from 'express'
import { Controller, Post } from '@decorators/express'

import Users from '../models/Users'

const { COOKIE, ACCESS_TOKEN_SECRET } = process.env

@Controller('/api/auth')
export default class AuthController {
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
}
