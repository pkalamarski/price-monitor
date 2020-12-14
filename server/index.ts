import path from 'path'
import Axios from 'axios'
import dotenv from 'dotenv'
import express from 'express'
dotenv.config()

import router from './routes'

const { SERVER_URL, API_KEY } = process.env

const app = express()
const port = 8080

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
  Axios.get(SERVER_URL + '/api/trigger-monitor', { params: { key: API_KEY } })
  console.log(`🚀 Server listening on port ${port}`)
})
