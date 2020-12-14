import path from 'path'
import cors from 'cors'
import Axios from 'axios'
import dotenv from 'dotenv'
import express from 'express'
dotenv.config()

import router from './routes'
import { logError, logInfo } from './logger'

const { SERVER_URL, API_KEY } = process.env

const triggerMonitor = () => {
  try {
    Axios.get(`${SERVER_URL}/api/trigger-monitor`, {
      params: { key: API_KEY }
    })
  } catch (e) {
    logError('Price monitor not able to start')
    logError(e)
  }
}

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
  triggerMonitor()
})
