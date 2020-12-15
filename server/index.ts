import path from 'path'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
dotenv.config()

import router from './routes'
import { logInfo } from './logger'

const app = express()
const port = 8080

app.use(cors())

app.get('/health', async (req, res) => {
  res.send('OK')
})

app.use('/', router)

app.use('/static', express.static('dist_web'))
app.use('/', express.static('dist_web'))

app.get('*', (req, res) =>
  res.sendFile(path.join(process.cwd(), 'dist_web/index.html'))
)

app.listen(port, () => {
  logInfo(`🚀 Server listening on port ${port}`)
})
