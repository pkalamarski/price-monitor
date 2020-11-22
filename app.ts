import dotenv from 'dotenv'
import express from 'express'
dotenv.config()

import initialize from './src/initialize'
import checkMapping from './src/checkMapping'

const app = express()
const port = 8080

app.get('/', (req, res) => {
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

app.listen(port, () => {
  initialize()
  console.log('Ready to serve requests')
})
