import got from 'got'
import cheerio from 'cheerio'
import puppeteer from 'puppeteer'
import { Inject, Injectable } from '@decorators/di'

import Products, { IProduct } from '../models/Products'
import PriceData, { IPriceData } from '../models/PriceData'
import SiteMapping, { ISiteMapping } from '../models/SiteMapping'

import PriceDataService from './PriceDataService'
import { logError, logInfo, logVerbose } from '../logger'

interface IFetchSetup {
  productPriceData: IPriceData
  siteMapping: ISiteMapping
  strippedHost: string
}

interface IFetchedPrices {
  mainPrice: number
  preDiscountPrice: number
}

@Injectable()
class CrawlerService {
  constructor(
    @Inject(PriceDataService) private priceDataService: PriceDataService
  ) {}

  async fetchPrices(): Promise<void> {
    logInfo('JOB: Starting price check job')

    const products = await Products.getAll()

    const startTime = new Date()

    const mapping = await SiteMapping.getAll()
    const priceData = await PriceData.getAll()

    const checkpoints = [0.2, 0.4, 0.6, 0.8, 1].map((p) =>
      Math.floor(p * products.length)
    )

    const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
    const page = await browser.newPage()

    let itemTimes: number[] = []

    for (const [index, product] of products.entries()) {
      const itemStart = new Date()

      const { productPriceData, strippedHost, siteMapping } = this.getSetupData(
        product,
        priceData,
        mapping
      )

      if (checkpoints.includes(index + 1)) {
        logInfo(`Checkpoint: ${index + 1} of ${products.length} prices checked`)
      }

      if (!siteMapping) {
        logError(`No mapping for host: ${strippedHost}`)
        continue
      }

      await this.fetchProductData(page, product, siteMapping, productPriceData)

      itemTimes = [...itemTimes, new Date().getTime() - itemStart.getTime()]
    }

    await browser.close()

    const elapsedSeconds = (new Date().getTime() - startTime.getTime()) / 1000
    const { avg, high, low } = this.calculateAverageTime(itemTimes)

    logInfo(
      `SUCCESS: ${products.length} prices checked in ${elapsedSeconds.toFixed(
        1
      )} seconds`
    )

    logVerbose(`Fastest fetch time: ${low}ms`)
    logVerbose(`Average fetch time: ${avg}ms`)
    logVerbose(`Slowest fetch time: ${high}ms`)
  }

  async fetchProductData(
    page: puppeteer.Page,
    product: IProduct,
    siteMapping: ISiteMapping,
    productPriceData: IPriceData
  ): Promise<void> {
    const { id: productId, url } = product
    logVerbose(`Fetching prices for productId: ${productId}`)

    try {
      let fetchedPrices: IFetchedPrices

      if (siteMapping.usePuppeteer) {
        fetchedPrices = await this.fetchWithPupeteer(page, url, siteMapping)
      } else {
        fetchedPrices = await this.fetchWithCheerio(url, siteMapping)
      }

      await this.priceDataService.saveProductPrice(
        productId,
        productPriceData,
        fetchedPrices
      )
    } catch (e) {
      logError(`URL: ${url}`)
      logError(e)
    }
  }

  private async fetchWithPupeteer(
    page: puppeteer.Page,
    url: string,
    siteMapping: ISiteMapping
  ): Promise<IFetchedPrices> {
    logVerbose('Fetching with Puppeteer')

    const { preDiscountSelector, priceSelector } = siteMapping

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 120000 })

    const tagsContent = await page.evaluate(
      ({ priceSelector, preDiscountSelector }) => {
        const mainPriceNode = document.querySelector(priceSelector)
        const preDiscountPriceNode = preDiscountSelector
          ? document.querySelector(preDiscountSelector)
          : undefined

        return {
          mainPrice: mainPriceNode?.innerText || '',
          preDiscountPrice: preDiscountPriceNode?.innerText || ''
        }
      },
      { priceSelector, preDiscountSelector }
    )

    return {
      mainPrice: this.parsePrice(tagsContent?.mainPrice),
      preDiscountPrice: this.parsePrice(tagsContent?.preDiscountPrice)
    }
  }

  private async fetchWithCheerio(
    url: string,
    siteMapping: ISiteMapping
  ): Promise<IFetchedPrices> {
    logVerbose('Fetching with Cheerio')

    const requestHeaders = {
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US,en;q=0.5',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:64.0) Gecko/20100101 Firefox/64.0',
      'X-Forwarded-Proto': 'https'
    }

    const { preDiscountSelector, priceSelector } = siteMapping

    const page = await got(url, { headers: requestHeaders, timeout: 120000 })
    const $ = cheerio.load(page.body)

    const rawPreDiscountPrice = $(preDiscountSelector).text()
    const rawNewPrice = $(priceSelector).text()

    const mainPrice = rawNewPrice ? this.parsePrice(rawNewPrice) : 0
    const preDiscountPrice =
      rawNewPrice && rawPreDiscountPrice
        ? this.parsePrice(rawPreDiscountPrice)
        : 0

    return { mainPrice, preDiscountPrice }
  }

  private getSetupData(
    product: IProduct,
    priceData: IPriceData[],
    mapping: ISiteMapping[]
  ): IFetchSetup {
    const { id, url } = product

    const productPriceData = priceData.find((price) => price.productId === id)

    const { host } = new URL(url)

    const strippedHost = host.replace('www.', '')
    const siteMapping = mapping.find((map) => map.host === strippedHost)

    return { productPriceData, siteMapping, strippedHost }
  }

  private parsePrice(price: string): number {
    const strippedPrice = price
      ?.split('zł')[0]
      .replace(/[^0-9.,-]+/g, '')
      .replace(',', '.')
      .replace('.-', '')

    return price === '-' ? 0 : Number(strippedPrice) || 0
  }

  private calculateAverageTime(times: number[]) {
    const high = times.sort((a, b) => b - a)[0]
    const avg = times.reduce((sum, t) => sum + t) / times.length
    const low = times.sort((a, b) => a - b)[0]

    return { high, avg, low }
  }
}

export default CrawlerService
