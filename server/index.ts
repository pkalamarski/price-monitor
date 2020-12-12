import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import path from 'path'
import router from './routes'

import JobService from './services/JobService'

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
  console.log('🚀 Ready to serve requests')
})
