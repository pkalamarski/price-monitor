import got from 'got'
import cheerio from 'cheerio'
import { google } from 'googleapis'

import initializeAuth from './authorize'
import { parsePrice } from './dataHandling'
import { logAction, logMultiple } from './logging'
import { getPageMapping } from './sheetDataHandling'

const checkMapping = async (url) => {
  const startTime = new Date()
  const auth = initializeAuth()
  const sheets = google.sheets({ version: 'v4', auth })

  await logMultiple([null, 'JOB: Starting check mapping job'], sheets)

  const mappingStart = new Date()
  const mapping = await getPageMapping(sheets)
  await logAction('[1/3] Get page mapping', sheets, mappingStart)

  const pageStart = new Date()
  const page = await got(url)
  const $ = cheerio.load(page.body)
  await logAction('[2/3] Load page', sheets, pageStart)

  const parseStart = new Date()
  const { host } = new URL(url)
  const strippedHost = host.replace('www.', '')
  const siteMapping = mapping.find((map) => map.host === strippedHost)

  if (!siteMapping) {
    await logAction(`ERROR: No mapping for host: ${strippedHost}`, sheets)

    return {
      error: `ERROR: No mapping for host: ${strippedHost}`
    }
  }

  const { selector, useHTML } = siteMapping

  const rawPrice = useHTML ? $(selector).html() : $(selector).text()
  const elapsedSeconds = (
    (new Date().getTime() - startTime.getTime()) /
    1000
  ).toFixed(1)

  await logAction('[3/3] Parse page', sheets, parseStart)
  await logMultiple(
    [
      `SUCCESS: Mapping for host ${strippedHost} checked in ${elapsedSeconds} seconds`,
      null
    ],
    sheets
  )

  return {
    url,
    useHTML,
    rawPrice,
    formattedPrice: parsePrice(rawPrice || '-'),
    htmlPrice: $(selector).html(),
    textPrice: $(selector).text()
  }
}

export default checkMapping
