import got from 'got'
import cheerio from 'cheerio'
import { uniq } from 'lodash'
import { Injectable } from '@decorators/di'

import { logInfo } from '../../logger'
import CheckedPages from '../../models/flat-monitor/CheckedPages'

export interface IPageData {
  url: string
  title: string
  description: string
  price: number
  roomCount: number
}

const headers = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:64.0) Gecko/20100101 Firefox/64.0',
  'X-Forwarded-Proto': 'https'
}

@Injectable()
export default class ScanService {
  async excludeCheckedPages(allActiveOffers: string[]): Promise<string[]> {
    logInfo('Excluding already checked offers')

    const checkedPages = await CheckedPages.getAll()

    const allCheckedUrls = uniq(
      checkedPages.map((check) => check.checkedUrls).flat()
    )

    const pagesNotCheckedYet = allActiveOffers.filter(
      (url) => !allCheckedUrls.includes(url)
    )

    return pagesNotCheckedYet
  }

  async scanOffers(urls: string[]): Promise<IPageData[]> {
    logInfo('Scanning new offers')

    const pagesData: IPageData[] = []

    const checkpoints = this.getCheckpoints(urls.length)

    for await (const [index, url] of urls.entries()) {
      const checkpoint = checkpoints.includes(index + 1)

      if (checkpoint) this.logCheckpoint(index, urls.length)

      const data = await this.scanPage(url)

      pagesData.push(data)
    }

    const checkedUrls = pagesData.map((page) => page.url)

    await CheckedPages.create({ checkedUrls })

    return pagesData
  }

  private async scanPage(url: string): Promise<IPageData> {
    const page = await got(url, { headers })

    if (url.includes('otodom')) {
      const pageData = this.scanOtodom(page.body, url)

      return pageData
    } else {
      const pageData = this.scanOlx(page.body, url)

      return pageData
    }
  }

  private scanOlx(pageBody: string, url: string): IPageData {
    const $ = cheerio.load(pageBody)
    const title = $('h1').text().replace('\n', '').trim()

    const offerPriceRaw = $("meta[name='description']")
      .attr('content')
      ?.split('zł')[0]
      .split(' ')
      .join('')
    const price = Number(offerPriceRaw)

    const descriptionPart = $("meta[name='description']")
      .attr('content')
      ?.split('zł')[1]
      .slice(10, 50)

    const descriptionRaw = $('div')
      .toArray()
      .map((el) => $(el).text().split('\t').join('').split('\n').join(''))
      .filter(Boolean)
      .filter((text) => text.includes(descriptionPart as string))

    const description = descriptionRaw.reverse()[0]?.trim() || null

    const roomCountRaw = $('ul > li')
      .map((_i, el) => $(el).text().split('\t').join('').split('\n').join(''))
      .toArray()
      .filter((text) => ((text as unknown) as string).includes('Liczba pokoi'))
      .toString()

    const roomCount = Number(
      roomCountRaw.split('Liczba pokoi').join('').split(' pokoje').join('')
    )

    return {
      url,
      title,
      description,
      price,
      roomCount
    }
  }

  private scanOtodom(pageBody: string, url: string): IPageData {
    const $ = cheerio.load(pageBody)
    const title = $('h1').text().replace('\n', '').trim()

    const offerPriceRaw = $('[aria-label="Cena"]')
      .text()
      ?.split('zł')[0]
      .split(' ')
      .join('')
    const price = Number(offerPriceRaw)

    const description = $('[data-cy="adPageAdDescription"]').text()

    const roomCount = Number(
      $('[aria-label="Liczba pokoi"]').text().split(':')[1]
    )

    return {
      url,
      title,
      description,
      price,
      roomCount
    }
  }

  private getCheckpoints = (length: number): number[] =>
    [0.2, 0.4, 0.6, 0.8, 1].map((p) => Math.floor(p * length))

  private logCheckpoint = (index: number, length: number): void => {
    console.info(`Checkpoint: ${index + 1} of ${length} flats scanned`)
  }
}
