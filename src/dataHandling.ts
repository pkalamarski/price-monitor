import got from 'got'
import cheerio from 'cheerio'
import { sheets_v4 } from 'googleapis'

import { getPageMapping, IItem, IPrice } from './sheetDataHandling'
import { calculateTimeDiff, logAction, logMultiple } from './logging'

const requestHeaders = {
  'Upgrade-Insecure-Requests': '1',
  Dnt: '1',
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept-Language': 'en-US,en;q=0.5',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:64.0) Gecko/20100101 Firefox/64.0',
  Connection: 'close',
  'X-Forwarded-Proto': 'http'
}

export const checkPrices = async (items: IItem[], sheets: sheets_v4.Sheets) => {
  const start = new Date()

  const mappingStart = new Date()
  const mapping = await getPageMapping(sheets)
  await logAction('[3/7] Get page mapping', sheets, mappingStart)

  await logAction('[4/7] Get item prices process started', sheets)

  let prices: IPrice[] = []

  const checkpoints = [0.2, 0.4, 0.6, 0.8, 1].map((p) =>
    Math.floor(p * items.length)
  )

  for (let item of items) {
    const { id: itemId, index, url, price: lastPrice } = item

    if (checkpoints.includes(index + 1)) {
      await logAction(
        `Checkpoint: ${index + 1} of ${items.length} prices checked`,
        sheets
      )
    }

    if (url === '-') {
      prices.push({
        itemId,
        url: '-',
        oldPrice: ' ',
        newPrice: ' '
      })
      continue
    }

    const itemStart = new Date()

    try {
      const page = await got(url, { headers: requestHeaders })
      const $ = cheerio.load(page.body)

      const { host } = new URL(url)

      const strippedHost = host.replace('www.', '')

      const siteMapping = mapping.find((map) => map.host === strippedHost)

      if (!siteMapping) {
        await logAction(`ERROR: No mapping for host: ${strippedHost}`, sheets)
        prices.push({
          itemId,
          url,
          oldPrice: ' ',
          newPrice: '?'
        })
        continue
      }

      const { preDiscountSelector, priceSelector, useHTML } = siteMapping

      const name = $("meta[property='og:title']").attr('content')
      const rawPreDiscountPrice = useHTML
        ? $(preDiscountSelector).html()
        : $(preDiscountSelector).text()
      const rawNewPrice = useHTML
        ? $(priceSelector).html()
        : $(priceSelector).text()

      const priceData: IPrice = {
        itemId,
        name,
        url,
        oldPrice: lastPrice,
        preDiscount: rawNewPrice ? parsePrice(rawPreDiscountPrice || '-') : '-',
        newPrice: parsePrice(rawNewPrice || '-'),
        time: calculateTimeDiff({ start: itemStart })
      }

      prices.push(priceData)
    } catch (e) {
      await logMultiple(
        [
          `ERROR: Cannot fetch price after ${(
            calculateTimeDiff({ start: itemStart }) / 1000
          ).toFixed()} seconds`,
          `ERROR: URL: ${url}`,
          `ERROR: Name: ${e.name}`,
          `ERROR: Code ${e.code}`
        ],
        sheets
      )
      console.error(e)
      prices.push({
        itemId,
        url,
        oldPrice: lastPrice,
        newPrice: '?',
        time: calculateTimeDiff({ start: itemStart })
      })
    }
  }

  await logAction('[4/7] Get item prices process finished', sheets, start)

  return prices
}

export const parsePrice = (price: string): string | number => {
  const strippedPrice = price
    ?.split('zł')[0]
    .replace(/[^0-9.,-]+/g, '')
    .replace(',', '.')
    .replace('.-', '')

  return price === '-' ? price : Number(strippedPrice) || '?'
}
