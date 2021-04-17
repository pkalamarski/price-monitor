import got from 'got'
import cheerio from 'cheerio'
import puppeteer from 'puppeteer'
import { Inject, Injectable } from '@decorators/di'

import Report from '../../models/price-monitor/Report'
import Products, { IProduct } from '../../models/price-monitor/Products'
import PriceData, { IPriceData } from '../../models/price-monitor/PriceData'
import SiteMapping, {
  ISiteMapping
} from '../../models/price-monitor/SiteMapping'

import PriceDataService from './PriceDataService'

import timeElapsed from '../../utility/timeElapsed'
import { logError, logInfo, logVerbose } from '../../logger'

interface ITimeReport {
  productId: string
  timeElapsed: number
}

interface IFetchSetup {
  productPriceData: IPriceData
  siteMapping: ISiteMapping
  strippedHost: string
}

interface IFetchedPrices {
  mainPrice: number
  preDiscountPrice: number
}

const { ENV } = process.env

@Injectable()
export default class CrawlerService {
  constructor(
    @Inject(PriceDataService) private priceDataService: PriceDataService
  ) {}

  async fetchPrices(): Promise<void> {
    logInfo('JOB: Starting price check job')

    const startTime = new Date()

    const [products, mapping, priceData, browser] = await Promise.all([
      Products.getAll(),
      SiteMapping.getAll(),
      PriceData.getAll(),
      puppeteer.launch({
        args: this.puppeteerArgs
      })
    ])

    const checkpoints = this.getCheckpoints(products.length)

    const page = await browser.newPage()

    let timeReport: ITimeReport[] = []

    for (const [index, product] of products.entries()) {
      const itemStart = new Date()

      const checkpoint = checkpoints.includes(index + 1)

      const { productPriceData, strippedHost, siteMapping } = this.getSetupData(
        product,
        priceData,
        mapping
      )

      if (!siteMapping) {
        logError(`No mapping for host: ${strippedHost}`)
        logError(`Product id: ${product.id}`)
        continue
      }

      await this.fetchProductData(page, product, siteMapping, productPriceData)

      if (checkpoint) this.logCheckpoint(index, products.length)

      timeReport = [
        ...timeReport,
        { productId: product.id, timeElapsed: timeElapsed(itemStart) }
      ]
    }

    const elapsed = timeElapsed(startTime)
    const { avg, high, highProductId, low } = this.calculateFetchTimes(
      timeReport
    )

    await Promise.all([
      browser.close(),
      ENV !== 'dev' &&
        Report.create({
          date: startTime,
          low,
          avg,
          high,
          highProductId,
          duration: elapsed,
          numberOfProducts: products.length
        })
    ])

    logInfo(
      `SUCCESS: ${products.length} prices checked in ${(elapsed / 1000).toFixed(
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

    const {
      preDiscountSelector,
      priceSelector,
      puppeteerWaitUntil
    } = siteMapping

    await page.goto(url, {
      waitUntil: puppeteerWaitUntil || 'domcontentloaded',
      timeout: 30000
    })

    const { mainPrice, preDiscountPrice } = await page.evaluate(
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
      mainPrice: this.parsePrice(mainPrice),
      preDiscountPrice: this.parsePrice(preDiscountPrice)
    }
  }

  private async fetchWithCheerio(
    url: string,
    siteMapping: ISiteMapping
  ): Promise<IFetchedPrices> {
    logVerbose('Fetching with Cheerio')

    const { preDiscountSelector, priceSelector, isMetaTag } = siteMapping

    const page = await got(url, {
      headers: this.cheerioRequestHeaders,
      timeout: 20000
    })
    const $ = cheerio.load(page.body)

    const rawPreDiscountPrice = $(preDiscountSelector).text()
    const rawMainPrice = !isMetaTag
      ? $(priceSelector).text()
      : $(priceSelector).attr('content')

    return {
      mainPrice: this.parsePrice(rawMainPrice || ''),
      preDiscountPrice: this.parsePrice(rawPreDiscountPrice || '')
    }
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

  private calculateFetchTimes(times: ITimeReport[]) {
    if (!times.length) return { high: 0, highProductId: null, avg: 0, low: 0 }

    const { productId: highProductId, timeElapsed: high } = times.sort(
      (a, b) => b.timeElapsed - a.timeElapsed
    )[0]
    const avg = times.reduce((sum, t) => sum + t.timeElapsed, 0) / times.length
    const low = times.sort((a, b) => a.timeElapsed - b.timeElapsed)[0]
      .timeElapsed

    return { high, highProductId, avg, low }
  }

  private getCheckpoints = (length: number): number[] =>
    [0.2, 0.4, 0.6, 0.8, 1].map((p) => Math.floor(p * length))

  private logCheckpoint = (index: number, length: number): void => {
    logInfo(`Checkpoint: ${index + 1} of ${length} prices checked`)
  }

  private puppeteerArgs = [
    '--disable-canvas-aa',
    '--disable-2d-canvas-clip-aa',
    '--disable-gl-drawing-for-tests',
    '--disable-dev-shm-usage',
    '--no-zygote',
    '--use-gl=swiftshader',
    '--enable-webgl',
    '--hide-scrollbars',
    '--mute-audio',
    '--no-first-run',
    '--disable-infobars',
    '--disable-breakpad',
    '--window-size=1280,1024',
    '--user-data-dir=./chromeData',
    '--no-sandbox',
    '--disable-setuid-sandbox'
  ]

  private cheerioRequestHeaders = {
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.5',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:64.0) Gecko/20100101 Firefox/64.0',
    'X-Forwarded-Proto': 'https'
  }
}
