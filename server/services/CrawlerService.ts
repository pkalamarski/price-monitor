import got from 'got'
import cheerio from 'cheerio'
import { Inject, Injectable } from '@decorators/di'

import Products from '../models/Products'
import PriceData, { IPriceData } from '../models/PriceData'
import SiteMapping, { ISiteMapping } from '../models/SiteMapping'

import PriceDataService from './PriceDataService'

const requestHeaders = {
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept-Language': 'en-US,en;q=0.5',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:64.0) Gecko/20100101 Firefox/64.0',
  'X-Forwarded-Proto': 'https'
}

@Injectable()
class CrawlerService {
  constructor(
    @Inject(PriceDataService) private priceDataService: PriceDataService
  ) {}

  async fetchPrices() {
    console.log('Starting price check job')

    const products = await Products.getAll()

    const start = new Date()

    const mapping = await SiteMapping.getAll()
    const priceData = await PriceData.getAll()

    const checkpoints = [0.2, 0.4, 0.6, 0.8, 1].map((p) =>
      Math.floor(p * products.length)
    )

    for (let product of products) {
      const { id, url } = product
      const productPriceData = priceData.find((price) => price.productId === id)
      const { host } = new URL(url)

      const strippedHost = host.replace('www.', '')
      const siteMapping = mapping.find((map) => map.host === strippedHost)
      // Log checkpoint
      if (!siteMapping) {
        console.log(`ERROR: No mapping for host: ${strippedHost}`)
        continue
      }

      await this.fetchProductData(url, siteMapping, productPriceData)
    }

    // Log completed
  }

  async fetchProductData(
    url: string,
    siteMapping: ISiteMapping,
    productPriceData: IPriceData
  ) {
    try {
      const page = await got(url, { headers: requestHeaders })
      const $ = cheerio.load(page.body)

      const { preDiscountSelector, priceSelector } = siteMapping

      const rawPreDiscountPrice = $(preDiscountSelector).text()
      const rawNewPrice = $(priceSelector).text()

      const formattedPrice = rawNewPrice ? parsePrice(rawNewPrice) : 0
      const formattedPreDiscount =
        rawNewPrice && rawPreDiscountPrice ? parsePrice(rawPreDiscountPrice) : 0

      await this.priceDataService.saveProductPrice(productPriceData, {
        formattedPrice,
        formattedPreDiscount
      })
    } catch (e) {
      console.log(e)
      // Log error
    }
  }
}

export const parsePrice = (price: string): number => {
  const strippedPrice = price
    ?.split('zł')[0]
    .replace(/[^0-9.,-]+/g, '')
    .replace(',', '.')
    .replace('.-', '')

  return price === '-' ? 0 : Number(strippedPrice) || 0
}

export default CrawlerService
