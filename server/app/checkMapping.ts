import got from 'got'
import cheerio from 'cheerio'

import { parsePrice } from '../services/CrawlerService'
import SiteMapping from '../models/SiteMapping'

interface IPriceSet {
  htmlPrice: string
  textPrice: string
  formattedHtmlPrice: string | number
  formattedTextPrice: string | number
}

interface IMappingCheck {
  url: string
  name: string

  currentPrice: IPriceSet
  preDiscountPrice: IPriceSet
}

const checkMapping = async (url: string): Promise<IMappingCheck> => {
  const startTime = new Date()

  // await logMultiple([null, 'JOB: Mapping check'], sheets)

  const mappingStart = new Date()
  const mapping = await SiteMapping.getAll()
  // await logAction('[1/3] Get page mapping', sheets, mappingStart)

  const pageStart = new Date()
  const page = await got(url)
  const $ = cheerio.load(page.body)
  // await logAction('[2/3] Load page', sheets, pageStart)

  const parseStart = new Date()
  const { host } = new URL(url)
  const strippedHost = host.replace('www.', '')
  const siteMapping = mapping.find((map) => map.host === strippedHost)

  if (!siteMapping) {
    // await logAction(`ERROR: No mapping for host: ${strippedHost}`, sheets)

    return null
  }

  const { preDiscountSelector, priceSelector } = siteMapping

  const htmlPrice = $(priceSelector).html()
  const textPrice = $(priceSelector).text()

  const htmlPreDiscount = $(preDiscountSelector).html()
  const textPreDiscount = $(preDiscountSelector).text()

  // const elapsedSeconds = (
  //   calculateTimeDiff({ start: startTime }) / 1000
  // ).toFixed(1)

  // await logAction('[3/3] Parse page', sheets, parseStart)
  // await logMultiple(
  //   [
  //     `SUCCESS: Mapping for host ${strippedHost} checked in ${elapsedSeconds} seconds`,
  //     null
  //   ],
  //   sheets
  // )

  return {
    url,
    name: $("meta[property='og:title']").attr('content'),
    currentPrice: {
      htmlPrice,
      textPrice,
      formattedHtmlPrice: parsePrice(htmlPrice),
      formattedTextPrice: parsePrice(textPrice)
    },
    preDiscountPrice: {
      htmlPrice: htmlPreDiscount,
      textPrice: textPreDiscount,
      formattedHtmlPrice: parsePrice(htmlPreDiscount),
      formattedTextPrice: parsePrice(textPreDiscount)
    }
  }
}

export default checkMapping
