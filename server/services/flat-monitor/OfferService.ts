import got from 'got'
import cheerio from 'cheerio'
import { uniq } from 'lodash'
import { Injectable } from '@decorators/di'

import { logInfo } from '../../logger'

const url = process.env.FLAT_MONITOR_BASE_URL

@Injectable()
export default class OfferService {
  async getAllActiveOffers(): Promise<string[]> {
    logInfo('Getting all active offers urls')

    const page = await got(url)
    const $ = cheerio.load(page.body)

    const pageCount = Number($('[data-cy="page-link-last"] span').text())

    const arr = new Array(pageCount).fill('')
    const allOffersNested = await Promise.all(
      arr.map((_, i) => this.getPageOffers(i + 1))
    )

    const allOffers = uniq(
      allOffersNested.flat().map((link) => {
        const obj = new URL(link)
        const noHash = obj.hash ? link.split(obj.hash)[0] : link

        if (noHash.includes('.html?')) {
          return noHash.split('.html?').join('') + '.html'
        } else {
          return noHash
        }
      })
    )

    return allOffers
  }

  private async getPageOffers(pageNumber: number): Promise<string[]> {
    const page = await got(url + `&page=${pageNumber}`)
    const $ = cheerio.load(page.body)

    const pageOffers = $('[data-cy="listing-ad-title"]')
      .toArray()
      .map((el) => el.attribs['href'])

    return pageOffers
  }
}
