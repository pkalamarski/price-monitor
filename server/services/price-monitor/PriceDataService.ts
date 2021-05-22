import { Injectable } from '@decorators/di'

import PriceData, { IPriceData } from '../../models/price-monitor/PriceData'

import { logVerbose } from '../../logger'
import { getNewestPrice } from '../../utility/sortPrices'
import filterPrices from '../../utility/filterPrices'

export interface IProductOrder {
  [productId: string]: number
}

interface IFetchedData {
  mainPrice: number
  preDiscountPrice: number
}

@Injectable()
export default class PriceDataService {
  async saveProductPrice(
    productId: string,
    productPriceData: IPriceData,
    fetchedData: IFetchedData
  ): Promise<void> {
    const { mainPrice: formattedPrice } = fetchedData

    const newestPrice = getNewestPrice(productPriceData?.prices)

    if (!productPriceData) {
      this.addNewDocument(productId, fetchedData)
    } else if (newestPrice?.main === formattedPrice) {
      this.updatePriceDocument(productPriceData)
    } else {
      this.insertNewPrice(productPriceData, fetchedData)
    }
  }

  async getSortedPriceData(): Promise<IProductOrder> {
    const allPriceData = await PriceData.getAll()

    const sortedPriceData = allPriceData.sort(
      (a, b) =>
        new Date(getNewestPrice(filterPrices(b.prices)).date).getTime() -
        new Date(getNewestPrice(filterPrices(a.prices)).date).getTime()
    )

    const orderData: IProductOrder = sortedPriceData.reduce(
      (orderData, priceData, i) => ({ ...orderData, [priceData.productId]: i }),
      {}
    )

    return orderData
  }

  private async addNewDocument(
    productId: string,
    { mainPrice, preDiscountPrice }: IFetchedData
  ): Promise<void> {
    logVerbose('Adding new PriceData object')

    await PriceData.create({
      currency: 'PLN',
      productId: productId,
      prices: [
        {
          main: mainPrice,
          preDiscount: preDiscountPrice,
          date: new Date()
        }
      ]
    })
  }

  private async updatePriceDocument(
    productPriceData: IPriceData
  ): Promise<void> {
    logVerbose('Price is the same - skipping save')

    await PriceData.insertPrices(productPriceData)
  }

  private async insertNewPrice(
    productPriceData: IPriceData,
    { mainPrice, preDiscountPrice }: IFetchedData
  ): Promise<void> {
    logVerbose('Inserting new price')

    await PriceData.insertPrices(productPriceData, [
      {
        main: mainPrice,
        preDiscount: preDiscountPrice,
        date: new Date()
      }
    ])
  }
}
