import dotenv from 'dotenv'
import express from 'express'
import path from 'path'
dotenv.config()

import initialize from './app/initialize'
import checkMapping from './app/checkMapping'
import JobService from './services/JobService'

const app = express()
const port = 8080

app.get('/health', async (req, res) => {
  res.send('OK')
})

app.get('/check-mapping', async (req, res) => {
  if (!req.query.url) {
    res.send('No URL provided')
    return
  }

  const results = await checkMapping(req.query.url as string)

  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify(results, null, 2))
})

app.get('/force-check', (req, res) => {
  // forceCheck()
  res.send('Check job triggered.')
})

app.use('/static', express.static('dist_web'))
app.use('/', express.static('dist_web'))

app.get('*', (req, res) =>
  res.sendFile(path.join(process.cwd(), 'dist_web/index.html'))
)

app.listen(port, () => {
  JobService.priceCheck()
  console.log('🚀 Ready to serve requests')
})
