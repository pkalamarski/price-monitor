import { Injectable } from '@decorators/di'

import { logInfo } from '../../logger'
import { IPageData } from './ScanService'
import MatchingOffers, {
  IMatchingOffer
} from '../../models/flat-monitor/MatchingOffers'

const allKeywords = process.env.FLAT_KEYWORDS?.split(',') || []

@Injectable()
export default class AnalysisService {
  async getMatchingOffers(): Promise<IMatchingOffer[]> {
    const matchingOffers = await MatchingOffers.getAll()

    return matchingOffers
  }

  async analysePages(pages: IPageData[]): Promise<void> {
    logInfo('Analysing new offers for potential keyword matches')

    for await (const page of pages) {
      await this.analysePage(page)
    }
  }

  private async analysePage(page: IPageData): Promise<void> {
    const keyword = this.getKeyword(page)

    if (!keyword) return

    const { url, title, price, roomCount } = page

    await MatchingOffers.create({
      url,
      title,
      keyword,
      price,
      roomCount
    })
  }

  private getKeyword(page: IPageData): string {
    const titleKeywordMatch = this.containsKeyword(page?.title || '') || ''
    const descKeywordMatch = this.containsKeyword(page?.description || '') || ''

    const match = titleKeywordMatch || descKeywordMatch

    return match
  }

  private containsKeyword(text: string) {
    return allKeywords.find((keyword) =>
      text.toLowerCase().includes(keyword.toLowerCase())
    )
  }
}
