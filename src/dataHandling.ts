import got from 'got'
import cheerio from 'cheerio'
import { sheets_v4 } from 'googleapis'

import { calculateTimeDiff, logAction, logMultiple } from './logging'
import { getPageMapping, IPrice } from './sheetDataHandling'

export const checkPrices = async (urls: string[], sheets: sheets_v4.Sheets) => {
  const start = new Date()

  const mappingStart = new Date()
  const mapping = await getPageMapping(sheets)
  await logAction('[4/7] Get page mapping', sheets, mappingStart)

  await logAction('[5/7] Get item prices process started', sheets)

  let prices: IPrice[] = []

  const checkpoints = [0.2, 0.4, 0.6, 0.8, 1].map((p) =>
    Math.floor(p * urls.length)
  )

  for (let [index, url] of urls.entries()) {
    if (checkpoints.includes(index + 1)) {
      await logAction(
        `Checkpoint: ${index + 1} of ${urls.length} prices checked`,
        sheets
      )
    }

    if (url === '-') {
      prices.push({
        url: '-',
        price: ' '
      })
      continue
    }

    const itemStart = new Date()

    try {
      const page = await got(url)
      const $ = cheerio.load(page.body)

      const { host } = new URL(url)

      const strippedHost = host.replace('www.', '')

      const siteMapping = mapping.find((map) => map.host === strippedHost)

      if (!siteMapping) {
        await logAction(`ERROR: No mapping for host: ${strippedHost}`, sheets)
        prices.push({
          url,
          price: '?'
        })
        continue
      }

      const { preDiscountSelector, priceSelector, useHTML } = siteMapping

      const name = $("meta[property='og:title']").attr('content')
      const rawPreDiscountPrice = useHTML
        ? $(preDiscountSelector).html()
        : $(preDiscountSelector).text()
      const rawPrice = useHTML
        ? $(priceSelector).html()
        : $(priceSelector).text()

      prices.push({
        name,
        url,
        preDiscount: parsePrice(rawPreDiscountPrice || '-'),
        price: parsePrice(rawPrice || '-'),
        time: calculateTimeDiff({ start: itemStart })
      })
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
        url,
        price: '?',
        time: calculateTimeDiff({ start: itemStart })
      })
    }
  }

  await logAction('[5/7] Get item prices process finished', sheets, start)

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
