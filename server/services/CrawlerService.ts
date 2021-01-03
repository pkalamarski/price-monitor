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
export default class CrawlerService {
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

    const browser = await puppeteer.launch({
      args: [
        '--disable-canvas-aa', // Disable antialiasing on 2d canvas
        '--disable-2d-canvas-clip-aa', // Disable antialiasing on 2d canvas clips
        '--disable-gl-drawing-for-tests', // BEST OPTION EVER! Disables GL drawing operations which produce pixel output. With this the GL output will not be correct but tests will run faster.
        '--disable-dev-shm-usage', // ???
        '--no-zygote', // wtf does that mean ?
        '--use-gl=swiftshader', // better cpu usage with --use-gl=desktop rather than --use-gl=swiftshader, still needs more testing.
        '--enable-webgl',
        '--hide-scrollbars',
        '--mute-audio',
        '--no-first-run',
        '--disable-infobars',
        '--disable-breakpad',
        //'--ignore-gpu-blacklist',
        '--window-size=1280,1024', // see defaultViewport
        '--user-data-dir=./chromeData', // created in index.js, guess cache folder ends up inside too.
        '--no-sandbox', // meh but better resource comsuption
        '--disable-setuid-sandbox'
      ]
    })
    const page = await browser.newPage()

    let itemTimes: number[] = []

    for (const [index, product] of products.entries()) {
      const itemStart = new Date()

      const { productPriceData, strippedHost, siteMapping } = this.getSetupData(
        product,
        priceData,
        mapping
      )

      if (!siteMapping) {
        logError(`No mapping for host: ${strippedHost}`)

        if (checkpoints.includes(index + 1)) {
          logInfo(
            `Checkpoint: ${index + 1} of ${products.length} prices checked`
          )
        }

        continue
      }

      await this.fetchProductData(page, product, siteMapping, productPriceData)

      if (checkpoints.includes(index + 1)) {
        logInfo(`Checkpoint: ${index + 1} of ${products.length} prices checked`)
      }

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

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })

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

    const rawPrices = {
      mainPrice: tagsContent.mainPrice,
      preDiscountPrice: tagsContent.preDiscountPrice
    }

    return {
      mainPrice: this.parsePrice(rawPrices.mainPrice),
      preDiscountPrice: this.parsePrice(rawPrices.preDiscountPrice)
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

    const { preDiscountSelector, priceSelector, isMetaTag } = siteMapping

    const page = await got(url, { headers: requestHeaders, timeout: 20000 })
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

  private calculateAverageTime(times: number[]) {
    const high = times.sort((a, b) => b - a)[0]
    const avg = times.reduce((sum, t) => sum + t) / times.length
    const low = times.sort((a, b) => a - b)[0]

    return { high, avg, low }
  }
}
